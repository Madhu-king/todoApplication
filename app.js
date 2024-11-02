const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbpath = path.join(__dirname, 'todoApplication.db')
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
var isValid = require('date-fns/isValid')

const app = express()
app.use(express.json())

let db = null
const initialserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server is starting at 3000')
    })
  } catch (e) {
    console.log(`db error ${e.message}`)
  }
}

initialserver()

//api 1
const changeduedate = each => {
  return {
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
    category: each.category,
    dueDate: each.due_date,
  }
}
//scenario1 of status
const hasstatus = requestquery => {
  return requestquery.status !== undefined
}
//scenario2
const haspriority = requestquery => {
  return requestquery.priority !== undefined
}
//scenario 3
const haspriorityandstatus = requestquery => {
  return (
    requestquery.priority !== undefined && requestquery.status !== undefined
  )
}
//scenrio4
const hassearch = requestquery => {
  return requestquery.search_q !== undefined
}
//scnario5
const hascategoryAndstatus = requestquery => {
  requestquery.category !== undefined && requestquery.status !== undefined
}
//scenrio6
const hascategory = requestquery => {
  return requestquery.category !== undefined
}
//scnrio7
const hascategoryAndpriority = requestquery => {
  return (
    requestquery.category !== undefined && requestquery.priority !== undefined
  )
}
app.get('/todos/', async (request, response) => {
  let getTodoquery = ''
  let data = null
  const {search_q, priority, status, category} = request.query
  switch (true) {
    //scenario1
    case hasstatus(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodoquery = `SELECT * FROM todo WHERE status='${status}';`
        data = await db.all(getTodoquery)
        response.send(data.map(each => changeduedate(each)))
      } else {
        response.status(400)
        response.send('Invalid Todo status')
      }
      break
    //scenario2
    case haspriority(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodoquery = `SELECT * FROM todo WHERE priority='${priority}';`
        data = await db.all(getTodoquery)
        response.send(data.map(each => changeduedate(each)))
      } else {
        response.status(400)
        response.send('Invalid Todo priority')
      }
      break
    //scanrio3
    case haspriorityandstatus(request.query):
      if (
        (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') &&
        (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE')
      ) {
        getTodoquery = `SELECT * FROM todo WHERE priority='${priority}'&& status='${status}';`
        data = await db.run(getTodoquery)
        response.send(data)
      }
      break
    //scenario4
    case hassearch(request.query):
      if (request)
        getTodoquery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`
      data = await db.all(getTodoquery)
      response.send(data.map(each => changeduedate(each)))
      break

    //scenario5
    case hascategoryAndstatus(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodoquery = `SELECT * FROM todo WHERE category='${category}'&& status='${status}';`
          data = await db.run(getTodoquery)
          response.send(date)
        } else {
          response.send(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }

      break
    //scenrio6
    case hascategory(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        getTodoquery = `SELECT * FROM todo WHERE category='${category}';`
        data = await db.all(getTodoquery)
        response.send(data.map(each => changeduedate(each)))
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    //scnrio7
    case hascategoryAndpriority(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          category === 'WORK' ||
          category === 'HOME' ||
          category === 'LEARNING'
        ) {
          getTodoquery = `SELECT * FROM todo WHERE category='${category}'&& priority='${priority}';`
          data = await db.all(getTodoquery)
          response.send(data)
        } else {
          response.status(400)
          response.send('Invalid Todo Category')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }

      break
    default:
      getTodoquery = `SELECT * FROM todo;`
      data = await db.all(getTodoquery)
      response.send(data.map(each => changeduedate(each)))
  }
})

//api 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const dbquery = `SELECT * FROM todo WHERE id='${todoId}';`
  const dbresult = await db.get(dbquery)
  response.send(changeduedate(dbresult))
})

//api 3
app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  const DateMatched = isMatch(date, 'yyyy-MM-dd') // true

  if (DateMatched) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    const requestquery = `select * from todo where due_date='${newDate}';`
    const dbresult = await db.all(requestquery)
    response.send(dbresult) //pendiing
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

//api 4
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const postnewdate = format(new Date(dueDate), 'yyyy-MM-dd')
          const getpostquery = `INSERT INTO todo(id,todo,category,priority,status,due_date)
             VALUES('${id}','${todo}','${category}','${priority}','${status}','${postnewdate});`
          await db.get(getpostquery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})

//API 5
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body

  const previousdb = `SELECT * FROM todo WHERE id='${todoId}';`
  const prevresult = await db.get(previousdb)
  const {
    todo = prevresult.todo,
    status = prevresult.status,
    category = prevresult.category,
    priority = prevresult.priority,
    dueDate = prevresult.due_date,
  } = request.body

  let updated = ''
  switch (true) {
    case requestBody.status !== undefined:
      if (status === 'To Do' || status === 'IN PROGRESS' || status === 'DONE') {
        updated = `UPDATE todo
            SET todo='${todo}',priority='${priority}',category='${category}',status='${status}',due_date='${dueDate}'
            WHERE id='${todoId}';`
        await db.run(updated)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case requestBody.priority !== undefined:
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        updated = `UPDATE todo
            SET todo='${todo}',priority='${priority}',category='${category}',status='${status}',due_date='${dueDate}'
            WHERE id='${todoId}';`
        await db.run(updated)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case requestBody.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        updated = `UPDATE todo
            SET todo='${todo}',priority='${priority}',category='${category}',status='${status}',due_date='${dueDate}'
            WHERE id='${todoId}';`
        await db.run(updated)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    //updated todo
    case requestBody.todo !== undefined:
      updated = `UPDATE todo
            SET todo='${todo}',priority='${priority}',category='${category}',status='${status}',due_date='${dueDate}'
            WHERE id='${todoId}';`
      await db.run(updated)
      response.send('Todo Updated')
      break
    //updated duedate
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        const newdate = format(new Date(dueDate), 'yyyy-MM-dd')

        updated = `UPDATE todo
            SET todo='${todo}',priority='${priority}',category='${category}',status='${status}',due_date='${newdate}'
            WHERE id='${todoId}';`
        await db.run(updated)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})
//api 6
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deletequery = `DELETE FROM todo WHERE id='${todoId}';`
  await db.run(deletequery)
  response.send('Todo Deleted')
})
module.exports = app
