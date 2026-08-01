// Error personalizado utilizado para representar errores
// conocidos de la aplicación.
//
// El código identifica el tipo de error y permite que el
// middleware global determine el status HTTP y el mensaje.
export class customError extends Error {

constructor(code) {

// Inicializamos la clase Error con el código recibido.
super(code);

// Guardamos el código para que el errorHandler
// pueda identificar qué tipo de error ocurrió.
this.code = code;

}

}