function traduzir() {
    try {
        const inputJson = document.getElementById('entrada').value;
        const schema = JSON.parse(inputJson);

        const locales = {};
        const firstKeyName = Object.keys(schema)[0];
        const nameValue = tratarNome(schema[firstKeyName]?.name || ''); // Certificar-se de que o "name" existe
        const translatedSchema = traduzirSchema(schema, locales, firstKeyName, nameValue);

        document.getElementById('result_schema').innerText = JSON.stringify(translatedSchema, null, 2);
        document.getElementById('result_locales').innerText = JSON.stringify(locales, null, 2);
    } catch (error) {
        console.error('Erro ao analisar JSON de entrada:', error.message);
    }
}

function traduzirSchema(schema, locales, firstKeyName, nameValue) {
    const translatedSchema = Array.isArray(schema) ? [] : {};

    for (const key in schema) {
        if (schema.hasOwnProperty(key)) {
            if (!ignorarChave(key)) {
                const translationKey = getTranslationKey(firstKeyName, key);
                const value = schema[key];

                if (typeof value === 'object') {
                    translatedSchema[key] = traduzirSchema(value, locales, translationKey, nameValue);
                } else {
                    const reference = `t:sections.${translationKey}`;
                    adicionarTraducao(locales, translationKey, reference, value, nameValue);
                    translatedSchema[key] = reference;
                }
            } else {
                translatedSchema[key] = schema[key];
            }
        }
    }

    return translatedSchema;
}

function adicionarTraducao(locales, translationKey, reference, value, nameValue) {
    const keys = translationKey.split('.');
    let currentLocale = locales;

    keys.forEach((key, index) => {
        if (!currentLocale[key]) {
            if (index === keys.length - 1) {
                currentLocale[key] = Array.isArray(value) ? [] : {};
                currentLocale[key] = value;
            } else {
                currentLocale[key] = {};
                currentLocale = currentLocale[key];
            }
        } else if (index === keys.length - 1) {
            currentLocale[key] = key === "name" ? nameValue : value; // Substituir "name" pelo valor tratado do "name"
        } else {
            currentLocale = currentLocale[key];
        }
    });
}

function getTranslationKey(parentKey, attribute) {
    return parentKey ? `${parentKey}.${attribute}` : attribute;
}

function ignorarChave(key) {
    const chavesIgnoradas = ["limit", "class", "templates", "type", "id", "default"];
    return chavesIgnoradas.includes(key);
}

function tratarNome(name) {
    return name.toLowerCase().replace(/\s+/g, '-');
}
