import React, { createContext, useContext, useRef } from 'react'

type ValidatorFn = () => boolean

interface ValidationContextType {
  registerValidator: (ref: ValidatorFn) => void
  unregisterValidator: (ref: ValidatorFn) => void
  validateAll: () => boolean
}

const ValidationContext = createContext<ValidationContextType | null>(null)

export const ValidateProvider = ({ children }: { children: React.ReactNode }) => {
	const validationRefs = useRef<ValidatorFn[]>([])

	const registerValidator = (ref: ValidatorFn) => {
		if (!validationRefs.current.includes(ref)) {
			validationRefs.current.push(ref)
		}
	}

	const unregisterValidator = (ref: ValidatorFn) => {
		validationRefs.current = validationRefs.current.filter((v) => v !== ref)
	}

	const validateAll = (): boolean => {
		let acumulator = 0
		for (const validate of validationRefs.current) {
			const valid = validate()
			if (valid) acumulator++
		}
		return acumulator === validationRefs.current.length
	}

	return (
		<ValidationContext.Provider value={{ registerValidator, unregisterValidator, validateAll }}>
			{children}
		</ValidationContext.Provider>
	)
}

export const useValidation = (): ValidationContextType => {
	const ctx = useContext(ValidationContext)
	if (!ctx) throw new Error('useValidation must be used within ValidateProvider')
	return ctx
}
