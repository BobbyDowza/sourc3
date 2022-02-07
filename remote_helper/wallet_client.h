#pragma once

#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <iostream>
#include "utils.h"

namespace pit
{
    constexpr const char JsonRpcHeader[] = "jsonrpc";
    constexpr const char JsonRpcVersion[] = "2.0";

    namespace beast = boost::beast;     // from <boost/beast.hpp>
    namespace http = beast::http;       // from <boost/beast/http.hpp>
    namespace net = boost::asio;        // from <boost/asio.hpp>
    using tcp = net::ip::tcp;           // from <boost/asio/ip/tcp.hpp>

    class SimpleWalletClient
    {
    public:
        struct Options
        {
            std::string apiHost;
            std::string apiPort;
            std::string apiTarget;
            std::string appPath;
            std::string repoOwner;
            std::string repoName;
            std::string repoPath = ".";
            bool useIPFS = true;
        };

        SimpleWalletClient(const Options& options)
            : m_resolver(m_ioc)
            , m_stream(m_ioc)
            , m_options(options)
        {

        }

        ~SimpleWalletClient()
        {
            // Gracefully close the socket
            if (m_connected)
            {
                beast::error_code ec;
                m_stream.socket().shutdown(tcp::socket::shutdown_both, ec);

                if (ec && ec != beast::errc::not_connected)
                {
                    // doesn't throw, simply report
                    std::cerr << "Error: " << beast::system_error{ ec }.what() << std::endl;
                }
            }
        }

        std::string InvokeWallet(std::string args)
        {
            args.append(",repo_id=")
                .append(GetRepoID())
                .append(",cid=")
                .append(GetCID());
            return InvokeShader(std::move(args));
        }

        const std::string& GetRepoDir() const
        {
            return m_options.repoPath;
        }

        std::string LoadObjectFromIPFS(std::string&& hash);
        std::string SaveObjectToIPFS(const uint8_t* data, size_t size);

    private:

        void EnsureConnected()
        {
            if (m_connected)
                return;

            auto const results = m_resolver.resolve(m_options.apiHost, m_options.apiPort);

            // Make the connection on the IP address we get from a lookup
            m_stream.connect(results);
            m_connected = true;
        }

        std::string ExtractResult(const std::string& response);
        std::string InvokeShader(const std::string& args);
        const std::string& GetCID();
        const std::string& GetRepoID();
        std::string CallAPI(std::string&& request);

    private:
        net::io_context     m_ioc;
        tcp::resolver       m_resolver;
        beast::tcp_stream   m_stream;
        bool                m_connected = false;
        const Options&      m_options;
        std::string         m_repoID;
        std::string         m_cid;
    };
}