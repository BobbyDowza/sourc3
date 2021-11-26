#pragma once

#include <cstddef>
#include "Shaders/common.h"

namespace GitRemoteBeam
{
    enum Operations : uint8_t {
        REPO,
        OBJECTS,
        REFS,
    };
    constexpr Operations ALL_OPERATIONS[] = { REPO, OBJECTS, REFS };

	enum Permissions : uint8_t {
		DELETE_REPO = 0b0001,
		ADD_USER = 0b0010,
		REMOVE_USER = 0b0100,
		PUSH = 0b1000,
		ALL = DELETE_REPO | ADD_USER | REMOVE_USER | PUSH,
	};

#pragma pack(push, 1)

	typedef Opaque<20> git_oid;
	typedef Opaque<32> Hash256;

	Hash256 get_name_hash(const char* name, size_t len);

	struct RepoInfo
	{
		static constexpr size_t MAX_NAME_SIZE = 256;
		struct NameKey
		{
			PubKey	owner;
			Hash256	name_hash;
			NameKey(const PubKey& o, const Hash256& h)
				: owner(o)
			{
				Env::Memcpy(&name_hash, &h, sizeof(name_hash));
			}
		};
		using ID = uint64_t; // big-endinan
		struct BaseKey
		{
			Operations	tag;
			ID			repo_id;
			BaseKey(Operations t, RepoInfo::ID id)
				: tag(t)
				, repo_id(Utils::FromBE(id)) // swap bytes
			{

			}
		};
		struct Key : BaseKey
		{
			Key(RepoInfo::ID id)
				: BaseKey(REPO, id)
			{

			}
			Key() : Key(0)
			{

			}
		};

		Hash256 name_hash;
		ID repo_id;
		size_t cur_objs_number;
		PubKey owner;
		size_t name_length;
		char name[];
	};

	struct GitObject
	{
		using ID = uint64_t;

		struct Meta
		{
			struct Key : RepoInfo::BaseKey
			{
				ID obj_id;
				Key(RepoInfo::ID rid, const ID& oid)
					: RepoInfo::BaseKey(OBJECTS, rid), obj_id(oid)
				{}
			};
			enum Type : int8_t 
			{
				// excerpt from libgit2
				GIT_OBJECT_COMMIT = 1, /**< A commit object. */
				GIT_OBJECT_TREE = 2, /**< A tree (directory listing) object. */
				GIT_OBJECT_BLOB = 3, /**< A file revision object. */
				GIT_OBJECT_TAG = 4, /**< An annotated tag object. */
			} type;
			ID id;
			git_oid hash;
			uint32_t data_size;
		} meta;

		struct Data
		{
			struct Key : RepoInfo::BaseKey
			{
				git_oid	hash;
				Key(RepoInfo::ID rid, const git_oid& oid)
					: RepoInfo::BaseKey(OBJECTS, rid)
				{
					Env::Memcpy(&hash, &oid, sizeof(oid));
				}
			};
			char data[];
		} data;

		/*
		GitObject& operator=(const GitObject& from)
		{
			this->hash = from.hash;
			this->data_size = from.data_size;
			this->type = from.type;
			Env::Memcpy(this->data, from.data, from.data_size);
			return *this;
		}
		*/
	};

	struct GitRef
	{
		static constexpr size_t MAX_NAME_SIZE = 256;
		struct Key : RepoInfo::BaseKey
		{
			Hash256 name_hash;
			Key(RepoInfo::ID rid, const Hash256& nh)
				: RepoInfo::BaseKey(REFS, rid)
				, name_hash(nh)
			{
				Env::Memcpy(&name_hash, &nh, sizeof(name_hash));
			}

			Key(RepoInfo::ID rid, const char* name, size_t len)
				: RepoInfo::BaseKey(REFS, rid)
				, name_hash(get_name_hash(name, len))
			{
			}

			Key() : RepoInfo::BaseKey(REFS, 0)
			{

			}
		};

		git_oid commit_hash;
		size_t name_length;
		char name[];

		GitRef& operator=(const GitRef& from)
		{
			this->commit_hash = from.commit_hash;
			Env::Memcpy(this->name, from.name, from.name_length);
			return *this;
		}
	};

	struct ObjectsInfo 
	{
		size_t objects_number;
		//GitObject objects[];
		// data
	};

	struct RefsInfo
	{
		size_t refs_number;
		GitRef refs[];
	};

	struct RepoUser
	{
		struct Key
		{
			PubKey user;
			RepoInfo::ID repo_id;
			Key(const PubKey& u, RepoInfo::ID id)
				: user(u)
				, repo_id(id)
			{}
		};
	};

	struct UserInfo
	{
		uint8_t permissions;
	};

	struct ContractState
	{
		uint64_t last_repo_id;
	};

	struct InitialParams
	{
		static const uint32_t METHOD = 0;
	};

	struct CreateRepoParams
	{
		static const uint32_t METHOD = 2;
		PubKey repo_owner;
		size_t repo_name_length;
		char repo_name[];
	};

	struct DeleteRepoParams
	{
		static const uint32_t METHOD = 3;
		uint64_t repo_id;
		PubKey user;
	};

	struct AddUserParams
	{
		static const uint32_t METHOD = 4;
		uint64_t repo_id;
		PubKey initiator;
		PubKey user;
		uint8_t permissions;
	};

	struct RemoveUserParams
	{
		static const uint32_t METHOD = 5;
		uint64_t repo_id;
		PubKey user;
		PubKey initiator;
	};

	struct PushObjectsParams
	{
		static const uint32_t METHOD = 6;
		uint64_t repo_id;
		PubKey user;
		ObjectsInfo objects_info;
	};

	struct PushRefsParams
	{
		static const uint32_t METHOD = 7;
		uint64_t repo_id;
		PubKey user;
		RefsInfo refs_info;
	};

#pragma pack(pop)
}
