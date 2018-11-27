const path = require('path');

module.exports = {
  entry: './src/ts/TaxonomyExplorer.ts',
  externals: {
    'd3': 'd3'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'taxonomy-explorer.js',
    path: path.resolve(__dirname, 'dist')
  }
};