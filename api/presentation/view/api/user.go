package presentation

import (
	"net/http"

	"google.golang.org/appengine"

	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/standard"
	data "github.com/plavelo/sequencer/api/data/repository/datasource"
	domain "github.com/plavelo/sequencer/api/domain/entity"
)

// CreateUser is an API for creating a user
func CreateUser(c echo.Context) error {
	user := new(domain.User)
	if err := c.Bind(user); err != nil {
		return err
	}
	ctx := appengine.NewContext(c.Request().(*standard.Request).Request)
	err := data.CreateUser(ctx, user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusCreated, user)
}

// GetUsers GET /users/
func GetUsers(c echo.Context) error {
	ctx := appengine.NewContext(c.Request().(*standard.Request).Request)
	users := data.GetUsers(ctx)
	return c.JSON(http.StatusOK, users)
}

// GetUser GET /users/:id
func GetUser(c echo.Context) error {
	ctx := appengine.NewContext(c.Request().(*standard.Request).Request)
	id := c.Param("id")
	u, _ := data.GetUser(ctx, id)
	if u == nil {
		return c.JSON(http.StatusNotFound, nil)
	}
	return c.JSON(http.StatusOK, u)
}
