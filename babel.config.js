
module.exports = {
  'presets': [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      { modules: false },
    ],
  ],
  'plugins': [
    '@babel/plugin-transform-runtime',
    '@babel/proposal-object-rest-spread',
  ],
};
