package main

import (
	"github.com/labstack/echo/middleware"
	"github.com/plavelo/sequencer/api/auth"
	"github.com/plavelo/sequencer/api/presentation/view/api"
)

func init() {
	g := e.Group("/users")

	g.Use(middleware.CORS())
	g.Use(auth.UserAuth())

	g.POST("", presentation.CreateUser)
	g.GET("", presentation.GetUsers)
	g.GET("/:id", presentation.GetUser)
}
