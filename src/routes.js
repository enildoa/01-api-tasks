import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/buildRoutePath.js';

const database = new Database()

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const title = req.body.title ?? null
      const description = req.body.description ?? null

      if(!title) {
        return res.writeHead(422).end(JSON.stringify('No title in request'))
      }

      if(!description) {
        return res.writeHead(422).end(JSON.stringify('No description in request'))
      }

      const tasks = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert('tasks', tasks)

      return res.writeHead(201).end();
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query


      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)

      return res
        .end(JSON.stringify(tasks));
      }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const title = req.body.title ?? null
      const description = req.body.description ?? null

      const task = database.select('tasks', { id })
      if (task.length === 0) {
        return res.writeHead(400).end(JSON.stringify('Id invalid'))
      }

      if(!title && !description) {
        return res.writeHead(422).end(JSON.stringify('No title or description'))
      }

      let data = {};
      if(title && !description) {
        data.title = title
      }else if(!title && description) {
        data.description = description
      }else{
        data.title = title
        data.description = description
      }
      data.updated_at = new Date()
      database.update('tasks', id, data)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.select('tasks', { id })
      if (task.length === 0) {
        return res.writeHead(400).end(JSON.stringify('Id invalid'))
      }

      database.update('tasks', id, {
        completed_at: new Date(),
        updated_at: new Date(),
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const task = database.select('tasks', { id })
      if (task.length === 1) {
        database.delete('tasks', id)
      }else {
        return res.writeHead(400).end(JSON.stringify('Id invalid'))
      }

      return res.writeHead(204).end()
    }
  }
]