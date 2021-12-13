import { BeamButton, ListRender } from '@components/shared';
import { thunks } from '@libs/action-creators';
import { RootState, AppThunkDispatch } from '@libs/redux';
import { RepoId, RepoType } from '@types';
import React, { useState, ChangeEvent } from 'react';
import { connect } from 'react-redux';
import { Nav } from '@components/container/nav';
import { Modal, Input } from 'antd';
import { useParams } from 'react-router-dom';
import styles from './all-repos.module.css';

type LocationState = {
  page: string
};

type AllReposProps = {
  repos: RepoType[],
  getAllRepos: () => void,
  createRepos: (repo_name:string) => void,
  deleteRepos: (repo_id: RepoId) => void
};

const AllRepos = ({
  repos, getAllRepos, createRepos, deleteRepos
}:AllReposProps) => {
  React.useEffect(() => {
    getAllRepos();
  }, []);

  const location = useParams<'page' & 'oid'>() as LocationState;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputRepoName, setInputRepoName] = useState('');

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    createRepos(inputRepoName);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputRepoName(e.target.value);
  };

  return (
    <>
      <Nav />
      <div className={styles.repoHeader}>
        <BeamButton title="New" callback={showModal} />
      </div>
      <Modal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
      >
        <Input
          placeholder="Enter name repository"
          value={inputRepoName}
          onChange={handleChange}
          onPressEnter={handleOk}
        />
      </Modal>
      <ListRender
        page={+location.page}
        deleteRepos={deleteRepos}
        elements={repos}
        url="repos"
      />
    </>
  );
};

const mapState = ({ app: { isConnected, repos } }: RootState) => ({
  isConnected,
  repos
});

const mapDispatch = (dispatch: AppThunkDispatch) => ({
  getAllRepos: () => {
    dispatch(thunks.getAllRepos());
  },
  createRepos: (repo_name:string) => {
    if (repo_name === null) return;
    dispatch(thunks.createRepos(repo_name));
  },
  deleteRepos: (repo_id: number) => {
    dispatch(thunks.deleteRepos(repo_id));
  }
});

export default connect(mapState, mapDispatch)(AllRepos);
