const express = require('express')
const request = require('request')
const apicache = require('apicache')
const cache = apicache.middleware
const server = express()
const BLOG_URl = 'https://blog.ertrzyiks.me/'
const POSTS_URL = 'ghost/api/v0.1/posts/?client_id=ghost-frontend&client_secret=6da8d351e8da&include=tags&limit=3'

function getPosts(cb) {
  request(BLOG_URl + POSTS_URL, function (error, response, body) {
    try {
      const json = JSON.parse(body)
      cb(null, json.posts.map(function (post) {
        return {
          title: post.title,
          url: BLOG_URl + post.slug,
          image: post.image,
          tags: post.tags.map(function (tag) { return tag.name })
        }
      }))
    }
    catch (ex) {
      cb(null, [])
    }
  })
}

server.set('view engine', 'pug')

server.use(express.static(__dirname + '/public'))

server.get('/', cache('1 hour'), function (req, res) {
  getPosts(function (err, posts) {
    if (err) {
      res.status(500).send('Unexpected server error')
      return
    }

    res.render('index', { posts: posts }, function (err, html) {
      if (err) {
        res.status(500).send('Unexpected server error')
        return
      }

      res.write(html)
      res.end()
    })
  })
})


server.listen(process.env.PORT || 3000)
