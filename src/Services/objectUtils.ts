class ObjectUtils {
	/**
	 * Cria uma cópia profunda de um objeto usando JSON.parse e JSON.stringify.
	 * Funciona para objetos simples, mas não para funções, undefined, Symbol, etc.
	 * @param {Object} obj - O objeto a ser copiado.
	 * @returns {Object} - Uma cópia profunda do objeto.
	 */
	static deepCopy(obj: any): any {
		return JSON.parse(JSON.stringify(obj))
	}

	/**
	 * Verifica se um valor é um objeto (e não null ou array).
	 * @param {any} value - O valor a ser verificado.
	 * @returns {boolean} - True se for um objeto, false caso contrário.
	 */
	static isObject(value: any): boolean {
		return (
			value !== null && typeof value === "object" && !Array.isArray(value)
		)
	}

	/**
	 * Cria uma cópia profunda de um objeto, incluindo funções e tipos especiais.
	 * Usa recursão para copiar objetos aninhados.
	 * @param {Object} obj - O objeto a ser copiado.
	 * @returns {Object} - Uma cópia profunda do objeto.
	 */
	static deepClone(obj: any): any {
		if (obj === null || typeof obj !== "object") {
			return obj // Retorna primitivos ou null diretamente
		}

		if (obj instanceof Date) {
			return new Date(obj) // Copia objetos Date
		}

		if (Array.isArray(obj)) {
			return obj.map((item: any) => this.deepClone(item)) // Copia arrays recursivamente
		}

		const clonedObj: Record<string, any> = {}
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				clonedObj[key] = this.deepClone(obj[key]) // Copia propriedades recursivamente
			}
		}

		return clonedObj
	}
	static flattenObject(obj: any, ignoreProps: string[] = []) {
		const result: Record<string, any> = {}

		function flatten(current: any, path = "") {
			for (let key in current) {
				if (current.hasOwnProperty(key)) {
					const newPath = path ? `${path}.${key}` : key

					// Verifica se a propriedade deve ser ignorada
					if (ignoreProps.includes(newPath)) {
						continue
					}

					// Se o valor for um objeto, chama a função recursivamente
					if (
						typeof current[key] === "object" &&
						current[key] !== null &&
						!Array.isArray(current[key])
					) {
						flatten(current[key], newPath)
					} else {
						// Caso contrário, adiciona ao resultado
						result[newPath] = current[key]
					}
				}
			}
		}

		flatten(obj)
		return result
	}
	static toFormData = (formCopy: any) => {
		const formData = new FormData()

		for (const key in formCopy) {
			const value = formCopy[key]

			// Arquivo
			if (key === "anexo" && value instanceof File) {
				formData.append(key, value)
			}

			// Arrays ou Objetos (sem re-stringify se já for string)
			else if (
				(Array.isArray(value) || typeof value === "object") &&
				value !== null
			) {
				formData.append(key, JSON.stringify(value))
			}

			// Primitivos (string, number, boolean)
			else {
				formData.append(key, value)
			}
		}

		return formData
	}

	/**
	 * Util para normalizar sequências das tarefas (1..n, sem buracos ou repetição)
	 */
 static normalizeSequencias(sequencedItems: any[], sequenceField = "sequencia") {
	if (!Array.isArray(sequencedItems) || sequencedItems.length === 0) return []
	// Ordena por sequencia (nulos/undefined vão para o fim)
	const ordered = [...sequencedItems]
		.sort((a, b) => {
			const sa =
				typeof a[sequenceField] === "number"
					? a[sequenceField]
					: Number.POSITIVE_INFINITY
			const sb =
				typeof b[sequenceField] === "number"
					? b[sequenceField]	
					: Number.POSITIVE_INFINITY
			if (sa === sb) return 0
			return sa - sb
		})
		.map((t, idx) => ({ ...t, [sequenceField]: idx + 1 }))
	return ordered
}
}

export default ObjectUtils

// Exemplo de uso:
//   const original = {
//     name: "Teste",
//     details: {
//       date: new Date(),
//       values: [1, 2, 3],
//     },
//     func: () => console.log("Olá!"),
//   };

//   const copied = ObjectUtils.deepCopy(original); // Cópia simples (não copia funções)
//   const cloned = ObjectUtils.deepClone(original); // Cópia profunda (copia funções e tipos especiais)

//   console.log(copied); // { name: "Teste", details: { date: "2023-10-05T12:00:00.000Z", values: [1, 2, 3] } }
//   console.log(cloned); // { name: "Teste", details: { date: Date, values: [1, 2, 3] }, func: [Function] }
