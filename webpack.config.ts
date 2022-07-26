
import 'webpack-dev-server'; // types
import webpack from 'webpack';
import path from 'path';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import dotenv from 'dotenv';
import ESLintPlugin from 'eslint-webpack-plugin';
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { existsSync } from 'fs';
import TerserPlugin from 'terser-webpack-plugin';

const env = process.env.TARGET_ENV;

const envPath = path.join(__dirname, `.env.${env}`);

if (!existsSync(envPath))
{
  throw new Error(
    'Could not find file ' + envPath + '. Did you specify TARGET_ENV?'
  );
}

dotenv.config({ path: envPath });

const runEslint = process.env.LINT || env !== 'local';

const smp = new SpeedMeasurePlugin();

const inspectLoader = 
{
  loader: 'inspect-loader',
  options: 
  {
    callback: (inspect : any) => console.log(inspect.arguments),
  },
};

const config = (_ : any, argv : any) => smp.wrap(
  {
    devtool: argv.mode === 'development' && 'eval-cheap-source-map',
    entry: './src/main.tsx',
    output:
    {
      path: path.resolve(__dirname, 'tmp'),
      filename: 'bundle.js',
    },
    mode: argv.mode,
    optimization:
    {
      minimize: true,
      usedExports: true,
      minimizer: [new TerserPlugin()],
    },
    resolve:
    {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss'],
      modules: 
      [
        path.resolve(__dirname, './src/'),
        path.resolve(__dirname, './node_modules'),
      ],
    },
    module: 
    {
      rules: 
      [
        {
          test: /\.(woff|woff2|png|jpg|gif|svg)/,
          use: 'file-loader',
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          // exclude everything in node_modules except dashboard-api/...
          exclude: /node_modules/,
          sideEffects: false,
          use: 
          [
            ...(process.env.INSPECT ? [inspectLoader] : []),
            'babel-loader',
            {
              loader: 'ts-loader',
              options: 
              {
                allowTsInNodeModules: true,
                // speeds up compilation time (tsc will be executed when building)
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.(css|scss)$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          sideEffects: true,
        },
      ],
    },
    devServer:
    {
      allowedHosts: [
        'label.localhost',
      ],
      historyApiFallback: true,
      watchFiles: [
        './src/**',
        './webpack.config.ts',
        './node_modules/@unologin/react-ui/.!(node_modules/**)',
      ],
    },
    plugins: 
    [
      ...(process.env.ANALYZE ? 
        [new BundleAnalyzerPlugin({ openAnalyzer: false }) as any] : []
      ),
      new HTMLWebpackPlugin(
        {
          template: 'public/index.html',
          filename: 'index.html',
          inject: false,
        },
      ),
      ...(runEslint ? 
        [new ESLintPlugin(
          {
            extensions: ['ts', 'tsx'],
          },
        )] : []
      ),
      new webpack.DefinePlugin(
        {
          'process.env': JSON.stringify(process.env),
        },
      ),
    ],
  },
);

export default config;
