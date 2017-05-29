package domain

import "time"

// Status is a post entity
type Status struct {
	UserID    string
	Text      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
