'use strict';

const Config = use('Config');

/**
 * Engine Helper Class
 */
class Engine {

    /**
     * Get default value
     *
     * @param key
     * @return String|boolean
     */
    static get(key) {
        return Config.get(`config.${key}`)
    }

    /**
     * Get title case value
     *
     * @param key
     * @return String|boolean
     */
    static title(key) {
        return Config.get(`config.${key}`).replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
            if (+match === 0) return "";
            return match.toUpperCase();
        });
    }

    /**
     * Get camel case value
     *
     * @param key
     * @return String|boolean
     */
    static camel(key) {
        return Config.get(`config.${key}`).replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
            if (+match === 0) return "";
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }

    /**
     * Get snake case value
     *
     * @param key
     * @return String|boolean
     */
    static snake(key) {
        return Config.get(`config.${key}`).replace(/\W+/g, " ")
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('_');
    }

    /**
     * Get lower case value
     *
     * @param key
     * @return String|boolean
     */
    static lower(key) {
        return Config.get(`config.${key}`).toLowerCase()
    }

    /**
     * Get upper case value
     *
     * @param key
     * @return String|boolean
     */
    static upper(key) {
        return Config.get(`config.${key}`).toUpperCase()
    }

    /**
     * Get id value
     *
     * @param key
     * @return String|boolean
     */
    static id(key) {
        return Config.get(`config.${key}`).toLowerCase() + "_id"
    }
}

module.exports = Engine;
