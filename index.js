/*
Es importante que dotenv se importe antes 
de importar el modelo de Person. Esto garantiza 
que las variables de entorno del archivo .env 
estén disponibles globalmente antes de importar 
el código de los otros módulos.
*/
// Necesario para usar las variables de entorno
require('dotenv').config()
// Importamos el módulo Express, que es un marco de aplicación web para Node.js.
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
// Importamos el modelo person, de esta manera la variable Person será asignada al mismo objeto que define el módulo
const Person = require('./models/person')

// Creamos una nueva instancia de una aplicación Express. `app` es un objeto que tiene métodos para rutas y middleware, entre otras cosas.
const app = express()

// Añadimos el middleware `express.json()` a la pila de middleware de la aplicación. Este middleware analiza los cuerpos de las solicitudes entrantes en un formato JSON, lo que significa que podemos acceder al cuerpo de la solicitud como un objeto JavaScript en nuestros controladores de rutas.
app.use(express.json())

// Añadimos el middleware para permitir solicitudes de todos los orígenes, por defecto perimite solicitudes de todos los orígenes
app.use(cors())

// Para que Express muestre contenido estático , la página index.html y JavaScript, etc., necesitamos un middleware integrado de Express llamado static .
// Cada vez que Express recibe una solicitud HTTP GET, primero verificará si el directorio dist contiene un archivo correspondiente a la dirección de la solicitud. Si se encuentra un archivo correcto, Express lo devolverá.
app.use(express.static('dist'))

morgan.token('body', (req)=>{
    if(req.method==='POST'){
        return JSON.stringify(req.body)
    }
    else{
        return ''
    }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))



let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', morgan('tiny'), (request, response) => {
    // Esta línea de código crea una nueva instancia de la clase Date, que representa la fecha y hora actuales.
    // Luego, convierte esta instancia de Date a una cadena de texto (string) utilizando el método toString().
    const time = new Date().toString()
    response.send(`

    <p>Phonebook has info for ${persons.length} people</p>
    <p>${time}</p>
    
    `)
})

//Se hace solicitud GET a la url
app.get('/api/persons', (request, response) => {
    //Busca todas las personas de la base de datos
    Person.find({}).then(people =>{
        //Reponde y muestra en la pagina de la url todas las personas en formato json
        response.json(people)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person){
        response.json(person)
    }else{
        // Esta línea de código establece el código de estado HTTP de la respuesta a 404, que indica que el recurso solicitado no se encontró.
        // Luego, termina el proceso de respuesta, lo que significa que no se pueden enviar más datos al cliente.
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    // Este metodo deja solo las personas cuyo id sea diferente al id de request.params.id
    persons = persons.filter(person => person.id !== id)
    // Esta línea de código establece el código de estado HTTP de la respuesta a 204, que indica que la solicitud ha sido procesada con éxito pero no hay contenido para devolver.
    // Luego, termina el proceso de respuesta, lo que significa que no se pueden enviar más datos al cliente.
    response.status(204).end()
})

const getRandomInt = () => {
    // array de ids
    const max = 1000
    const ids = persons.map(person=>person.id)
    let random = Math.floor(Math.random()*max)
    while(ids.includes(random)){
        random = Math.floor(Math.random()*max)
    }
    return random
}

const checkName = (name) =>{
    const names = persons.map(person => person.name)
    
    return names.includes(name)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name && !body.number){
        // Codigo 400: solicitud incorrecta
        return response.status(400).json({
            error: 'name and number missing'
        })
    }
    if(!body.name){
        // Codigo 400: solicitud incorrecta
        return response.status(400).json({
            error: 'name missing'
        })
    }
    if(!body.number){
        // Codigo 400: solicitud incorrecta
        return response.status(400).json({
            error: 'number missing'
        })
    }
    if(checkName(body.name)){
        // Codigo 400: solicitud incorrecta
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    

    const person = {
        id: getRandomInt(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})


// De esta forma se usan las variables de entorno del archivo .env
const PORT = process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})