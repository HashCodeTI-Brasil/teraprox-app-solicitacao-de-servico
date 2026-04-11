import React, { createContext, useContext, useRef } from 'react'

const ValidationContext = createContext()

export const ValidateProvider = ({ children }) => {
	const validationRefs = useRef([])

	const registerValidator = (ref) => {
		if (!validationRefs.current.includes(ref)) {
			validationRefs.current.push(ref)
		}
	}

	const unregisterValidator = (ref) => {
		validationRefs.current = validationRefs.current.filter((v) => v !== ref)
	}

	const validateAll = () => {
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

export const useValidation = () => useContext(ValidationContext)
