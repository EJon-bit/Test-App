/* eslint-disable */
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const withPlugins = require('next-compose-plugins');
const withAntdLess = require('next-plugin-antd-less');

const pluginAntdLess = withAntdLess({
 
  lessVarsFilePath: './styles/antdVariables.less',
  lessLoaderOptions:{
    javascriptEnabled:true
  }
 
});

const antdDayjsPlugin= new AntdDayjsWebpackPlugin();

module.exports = withPlugins([[pluginAntdLess], [antdDayjsPlugin]], {
  webpack(config) {
    return config;
  },
  
});