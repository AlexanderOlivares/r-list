// no real data this is a trial run x2
module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: "",
      username: "",
      password: "",
      // or neither for authenticate from ssh-agent
    },
  },

  app: {
    // TODO: change app name and path
    name: "r-list",
    path: "../",

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
      ROOT_URL: "",
      MONGO_URL: "",
      // MONGO_OPLOG_URL: "mongodb://mongodb/local",
    },

    docker: {
      image: "zodern/meteor:root",
    },

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true,
  },

  // mongo: {
  //   version: "4.4.22",
  //   servers: {
  //     one: {},
  //   },
  // },

  // (Optional)
  // Use the proxy to setup ssl or to route requests to the correct
  // app when there are several apps

  // proxy: {
  //   domains: 'mywebsite.com,www.mywebsite.com',

  //   ssl: {
  //     // Enable Let's Encrypt
  //     letsEncryptEmail: 'email@domain.com'
  //   }
  // }
};
