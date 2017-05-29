package swagger

import "github.com/eaglesakura/swagger-go-core"

type ParameterValidatorFactoryImpl struct {

}

func (it *ParameterValidatorFactoryImpl)NewValidator(value interface{}, isNil bool) swagger.ParameterValidator {
	return &ParameterValidatorImpl{
		Value:value,
		IsNil:isNil,
	}
}

/**
 * デフォルトのValidatorを生成する
 *
 * nil値を直接interface{}に変換した場合、==nilチェックが行えない仕様上の問題がある。
 * 現時点ではworkaroundとして、isNilをコード生成で賄う。
 */
func NewValidatorFactory() swagger.ValidatorFactory {
	return &ParameterValidatorFactoryImpl{}
}