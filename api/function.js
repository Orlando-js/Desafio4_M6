const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
require("moment/locale/es");
const _ = require("lodash");
const chalk = require("chalk");

//Función que se encarga de registrar usuarios. 
//Hace una solicitud a la API randomuser.me para obtener datos de usuario aleatorios, 
const registrarUsuarios = async (req, res, next) => {
  try {
    const response = await axios.get("https://randomuser.me/api/?results=10");

    const data = response.data;
    const dataFormateada = formatearUsuario(data.results);
    const partitionMaleFemale = _.partition(dataFormateada, function (user) {
      return user.sexo == "male";
    });
    res.locals.datamale = partitionMaleFemale[0];
    res.locals.datafemale = partitionMaleFemale[1];
    mostrarEnConsolaConEstilos(partitionMaleFemale[0], "Hombres");
    mostrarEnConsolaConEstilos(partitionMaleFemale[1], "Mujeres");
    res.render("inicio");
  } catch (error) {
    next(error);
  }
};

//Función toma los datos de usuario obtenidos de la API y los formatea de una manera deseada. 
//Devuelve un nuevo array con los datos formateados.
function formatearUsuario(data) {
  const dataFormateada = data.map((item) => {
    return {
      name: item.name.first,
      lastname: item.name.last,
      id: uuidv4().slice(0, 6),
      date: crearRandomDate(),
      sexo: item.gender,
    };
  });
  return dataFormateada;
}

// Esta función genera una fecha aleatoria entre los años 1990 y 2024
function crearRandomDate() {
  const añoMinimo = 1990;
  const añoMaximo = 2024;
  const year =
    Math.floor(Math.random() * (añoMaximo - añoMinimo + 1)) + añoMinimo;

  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  const hora = Math.floor(Math.random() * 24);
  const minuto = Math.floor(Math.random() * 60);
  const segundo = Math.floor(Math.random() * 60);
  const fecha = moment(
    new Date(year, month, day, hora, minuto, segundo)
  ).format("dddd, MMMM D, YYYY h:mm:ss A");
  const fechaFormateada = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  return fechaFormateada == "Fecha inválida"
    ? "martes, mayo 07, 2024 9:38:13 PM"
    : fechaFormateada;
}

//Muestra los datos en consola
function mostrarEnConsolaConEstilos(data, sexo) {
  const maximos = maximoLargoPropiedaddeArraydeObjetos(data);
  console.log(
    "-".repeat(Object.values(maximos).reduce((a, b) => a + b, 0)) + "---"
  );
  console.log(`La data para ${sexo} es:`);
  console.log(`La cantidad de usuarios es: ${data.length}`);
  console.log(
    "nombre".padStart(maximos.name, " "),
    "apellido".padStart(maximos.lastname, " "),
    "id".padStart(maximos.id, " "),
    "fecha".padStart(maximos.date, " ")
  );
  const estilos = chalk.blue.bgWhite;

  data.forEach((obj) => {
    const { name, lastname, id, date } = obj;
    const arrayEstilos = Object.values({ name, lastname, id, date }).map(
      (value, index) => {
        switch (index) {
          case 0:
            return estilos(value.padStart(maximos.name, " "));
          case 1:
            return estilos(value.padStart(maximos.lastname, " "));
          case 2:
            return estilos(value.padStart(maximos.id, " "));
          case 3:
            return estilos(value.padStart(maximos.date, " "));
        }
      }
    );
    console.log(...arrayEstilos);
  });
}

//Funcion que calcula la longitud máxima de cada propiedad en un array de objetos 
//y devuelve un objeto con esas longitudes máximas
function maximoLargoPropiedaddeArraydeObjetos(array) {
  const maximos = { name: null, lastname: null, id: null, date: null };

  Object.keys(maximos).forEach((key) => {
    const arrayValuesForKey = array.map((obj) => obj[key]);
    arrayValuesForKey.push(key);
    maximos[key] = _.maxBy(arrayValuesForKey, (str) => str.length).length;
  });
  return maximos;
}

module.exports = {
  registrarUsuarios,
};
