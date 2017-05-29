package auth

import (
	"io/ioutil"

	"google.golang.org/appengine"

	"golang.org/x/net/context"

	"github.com/eaglesakura/gaefire"
	"github.com/eaglesakura/gaefire/factory"
	"github.com/labstack/echo"
	"github.com/labstack/echo/engine/standard"
)

// VerifyFirebaseAuthToken is checking token
func VerifyFirebaseAuthToken(ctx context.Context, token string) bool {
	serviceAccountFile, _ := ioutil.ReadFile("../firebase_credential.json")
	serviceAccount := factory.NewServiceAccount(serviceAccountFile)
	verifiedToken, err := serviceAccount.NewFirebaseAuthTokenVerifier(ctx, token).Valid()
	if err != nil {
		return false
	}
	// check user
	user := gaefire.FirebaseUser{}
	verifiedToken.GetUser(&user)

	// verified ok
	return true
}

// UserAuth returns an UserAuth middleware.
func UserAuth() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			token := c.Request().Header().Get(echo.HeaderAuthorization)
			ctx := appengine.NewContext(c.Request().(*standard.Request).Request)
			isValid := VerifyFirebaseAuthToken(ctx, token)
			if isValid {
				return next(c)
			}
			return echo.ErrUnauthorized
		}
	}
}
