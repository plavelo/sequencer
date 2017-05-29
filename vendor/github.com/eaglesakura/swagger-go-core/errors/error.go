/**
 * port by github.com/go-openapi/runtime/
 *
 * go-openapiは内部でunsafeを参照しているため、そのままではGAE/Goに組み込めない。
 * interfaceのみをportすることで互換性を保つ。
 */
package errors

import "fmt"

type apiError struct {
	code    int32
	message string
}

func (a *apiError) Error() string {
	return a.message
}

func (a *apiError) Code() int32 {
	return a.code
}

// New creates a new API error with a code and a message
func New(code int32, message string, args ...interface{}) error {
	if len(args) > 0 {
		return &apiError{code, fmt.Sprintf(message, args...)}
	}
	return &apiError{code, message}
}

