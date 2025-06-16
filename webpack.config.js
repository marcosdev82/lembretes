const path = require('path');

module.exports = {
        mode: 'development', // ou 'production' para builds finais
        entry: './src/index.js',
        output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true, // limpa a pasta dist a cada build
    },
    module: {
    rules: [
        {
            test: /\.js$/, // aplica a regra para arquivos .js
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader', // se estiver usando Babel
            },
        },
    ],
    },
    devtool: 'source-map', // útil para debug
    devServer: {
        static: './dist',
        open: true,
        port: 3000,
    },
};
