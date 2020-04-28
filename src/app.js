const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepoId(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id))
    return response.status(400).json({ "message": "Invalid ID" })
  next();
}

function repoIDExists(request, response, next) {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repo => repo.id === id);
  if (repoIndex < 0) {
    return response.status(400).json({ "message": "repository does not exist" })
  }
  next();
}

app.use(function (request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method}] ${url}`;
  console.log(logLabel)
  next()
})

app.use("/repositories/:id", validateRepoId, repoIDExists)

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }
  repositories.push(repository);
  return response.json(repository)
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  const { id } = request.params

  const repoIndex = repositories.findIndex(repo => repo.id === id);
  let repository = repositories[repoIndex];
  repository.title = title;
  repository.url = url;
  repository.techs = techs;

  repositories[repoIndex] = repository

  return response.json(repository)
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params
  const repoIndex = repositories.findIndex(repo => repo.id === id);
  repositories.splice(repoIndex, 1)
  return response.status(204).send();
});

app.post("/repositories/:id/like",validateRepoId, (request, response) => {
  const { id } = request.params
  const repoIndex = repositories.findIndex(repo => repo.id === id);
  let repository = repositories[repoIndex];
  repository.likes += 1;
  return response.json(repository)
});

module.exports = app;
