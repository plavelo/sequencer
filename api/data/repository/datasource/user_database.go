package data

import (
	"golang.org/x/net/context"

	"github.com/mjibson/goon"
	"github.com/plavelo/sequencer/api/domain/entity"
	"google.golang.org/appengine/datastore"
)

// CreateUser is a function adding a user
func CreateUser(ctx context.Context, user interface{}) error {
	g := goon.FromContext(ctx)
	if _, err := g.Put(user); err != nil {
		return err
	}
	return nil
}

// GetUsers is a function getting a user
func GetUsers(ctx context.Context) []*domain.User {
	q := datastore.NewQuery("User")
	var u []*domain.User
	q.GetAll(ctx, &u)
	return u
}

// GetUser is a function getting a user
func GetUser(ctx context.Context, id string) (*domain.User, error) {
	g := goon.FromContext(ctx)
	u := &domain.User{ID: id}
	if err := g.Get(u); err != nil {
		return nil, err
	}
	return u, nil
}
