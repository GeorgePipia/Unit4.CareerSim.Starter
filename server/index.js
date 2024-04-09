//step 1 importing packs

const pg = require('pg')  //this is a driver which lets to talk PostgreSQL database
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db') //database client that helps to talk database 
const app = express() //the app is instantion of express and itself will call to express

//app routes.
app.use(express.json());
app.use(require('morgan')('dev'));
app.post('/api/notes', async (req, res, next) => { // შექმენი create / SQL - INSERT
    try{
        const SQL = `INSERT INTO notes(txt)
        VALUES ($1)
        RETURNING *`
        const result = await client.query(SQL, [req.body.txt])
        res.send(result.rows[0])
    }
    catch(error){
        next(error)
    }

});
app.get('/api/notes', async (req, res, next) => { // წაიკითხე read / SELECT
    try{
        const SQL = `
        SELECT * from notes ORDER BY created_at DESC;`
        const result = await client.query(SQL)
        res.send(result.rows)

    }
    catch(error){
        next(error)
    }
});
app.put('/api/notes/:id', async (req, res, next) => { // განაახლე update/ replace
    try{
        const SQL = `
        UPDATE notes
        SET txt=$1, ranking=$2, updated_at=now()
        WHERE id=$3 RETURNING *
        `
        const result = await client.query(SQL, [req.body.txt, req.body.ranking, req.params.id])
        res.send(result.rows[0])

    }
    catch(error){
        next(error)
    }
});
app.delete('/api/notes/:id', async (req, res, next) => {
    try{
        const SQL = `DELETE FROM notes
        WHERE id=$1`
        const result = await client.query(SQL, [req.params.id])
        res.sendStatus(204)

    }catch(error){
        next(error)
    }

});

//st 2 create database in terminal:
// I createdb (name of the database =>) the_acme_notes_db
// II create async init() which handels all initializations of the database, or seeding or puting somethin in the database 
const init = async()=>{ // in here SQL table createn and data seedign is separated thats why there is let SQL for table creating
    //st 3 connect the client to pg --- which lets as talk to our database 
    await client.connect(); 
    
    console.log('connected ')
    //st 4 create SQL table
    let SQL = `
    DROP TABLE IF EXISTS notes;
    CREATE TABLE notes(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    txt VARCHAR(255) NOT NULL
    );
    `

    //st 5 now query the database - მოიითხოვს database 
    await client.query(SQL) // SQL says what language we are reuqesting 

    console.log('table created');

    SQL = ` INSERT INTO notes(txt, ranking) VALUES('learn express', 5);
    INSERT INTO notes(txt, ranking) VALUES('write SQL queries', 4);
    INSERT INTO notes(txt, ranking) VALUES('create routes', 2);
    `;
    await client.query(SQL);
    console.log(' data seedid ')

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`))
    
};

init();
