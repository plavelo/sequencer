package domain

import "time"

// User is a user entity
type User struct {
	ID             string    `json:"uid" datastore:"uid" goon:"id"`
	UserName       string    `json:"userName" datastore:"userName"`
	DisplayName    string    `json:"displayName" datastore:"displayName"`
	AvatarFileName string    `json:"avatarFileName" datastore:"avatarFileName"`
	FollowersCount int       `datastore:"followersCount"`
	FollowingCount int       `datastore:"followingCount"`
	CreatedAt      time.Time `datastore:"createdAt"`
	UpdatedAt      time.Time `datastore:"updatedAt"`
}
