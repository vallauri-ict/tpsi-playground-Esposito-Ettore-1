let _modulo = require("modulo");

_modulo();

let ris1 = _modulo.sum(2, 2);
let ris2 = _modulo.mol(6, 3);
console.log(ris1);
console.log(ris2);

console.log(_modulo.json.nome);
_modulo.json.setNome("Pluto");
console.log(_modulo.json.nome);

console.log(_modulo.MyClass.nome);
_modulo.MyClass.setNome("pluto");
console.log(_modulo.MyClass.nome);