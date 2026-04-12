const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const webpack = require('webpack');
const path = require('path');

require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';
const deps = require('./package.json').dependencies;

// Forward REACT_APP_* + NODE_ENV into the bundle as a single process.env object
// so that any process.env.X reference resolves to undefined (not ReferenceError)
const browserEnv = Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_') || key === 'NODE_ENV')
    .reduce((acc, key) => {
        acc[key] = process.env[key];
        return acc;
    }, {});


module.exports = {
    entry: './src/index.tsx',
    mode: isProd ? 'production' : 'development',
    // source-map em dev: inline rápido para HMR
    // hidden-source-map em prod: gera .map externo mas NÃO injeta o comentário
    // "//# sourceMappingURL=" no bundle público — os .map ficam disponíveis
    // apenas para upload manual ao servidor RUM (Sentry/Datadog), nunca
    // expostos ao browser do usuário final.
    devtool: isProd ? 'hidden-source-map' : 'eval-cheap-module-source-map',

    devServer: {
        port: 3004,
        historyApiFallback: true,
        hot: true,
        client: {
            overlay: false,
        },
    },

    output: {
        publicPath: 'auto',
        filename: '[name].[contenthash].js',
        chunkFilename: '[id].[contenthash].js',
        path: path.resolve(__dirname, 'build'),
        clean: true,
    },

    // ─── Optimization ────────────────────────────────────────────────────
    optimization: {
        // Stable chunk IDs → remoteEntry.js não invalida sem motivo
        moduleIds: 'deterministic',

        // NÃO usar runtimeChunk: 'single' num remote — o webpack embutiria o
        // runtime num arquivo separado que o core não sabe que precisa carregar,
        // quebrando o carregamento federado em produção.
        // O runtime fica inline no remoteEntry.js (comportamento padrão correto).
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: { fullySpecified: false },
            },
            {
                test: /\.(t|j)sx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [
                        ['@babel/preset-react', { runtime: 'automatic' }],
                        '@babel/preset-typescript',
                    ],
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },

    plugins: [
        new ModuleFederationPlugin({
            name: 'teraprox_app_solicitacao',
            filename: 'remoteEntry.js',
            exposes: {
                './SolicitacoesDeServico':    './src/Screens/SolicitacoesDeServico',
                './SolicitacaoDeServicoForm': './src/Screens/SolicitacaoDeServicoForm',
                './AprovacaoStatus':          './src/Screens/AprovacaoStatus',
                './FederatedBridge':          './src/federation/FederatedBridge',
                './ReducersBundle':           './src/federation/reducersBundle',
                './Manifest':                 './src/federation/manifest',
            },
            shared: {
                // Mesmo padrão do teraprox-core: eager + singleton evita 2 cópias do SDK
                // (dois CoreServiceContext → useCoreService ignora o FederatedBridge do host).
                'teraprox-core-sdk': {
                    singleton: true,
                    requiredVersion: false,
                    eager: true,
                },
                ...(() => {
                    const shared = {};
                    [
                        'react',
                        'react-dom',
                        'react-redux',
                        'react-router-dom',
                        '@reduxjs/toolkit',
                        'react-icons',
                        'react-bootstrap',
                        'react-toast-notifications',
                        'redux-persist',
                        'axios',
                        'dayjs',
                    ].forEach(pkg => {
                        if (deps[pkg]) {
                            shared[pkg] = {
                                singleton: true,
                                requiredVersion: false,
                                // eager: false → shared libs são lazy por padrão,
                                // o core carrega a instância singleton; esse remote
                                // reutiliza sem re-download
                                eager: false,
                            };
                        }
                    });
                    return shared;
                })(),
            },
        }),

        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),

        new webpack.DefinePlugin({
            'process.env': JSON.stringify(browserEnv),
        }),
    ],
};
