const Handlebars = require('handlebars');

// Helper para verificar se a primeira variável é maior que a segunda
Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
});

// Helper para verificar se a primeira variável é menor que a segunda
Handlebars.registerHelper('lt', function(a, b) {
    return a < b;
});

// Helper para somar dois números
Handlebars.registerHelper('add', function(a, b) {
    return a + b;
});

// Helper para subtrair dois números
Handlebars.registerHelper('subtract', function(a, b) {
    return a - b;
});

// Helper para criar um array de números
Handlebars.registerHelper('range', function(min, max) {
    const result = [];
    for (let i = min; i <= max; i++) {
        result.push(i);
    }
    return result;
});

// Helper para verificar se dois valores são iguais
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

module.exports = Handlebars;