'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {typeof import('@adonisjs/validator/src/Validator')} */
const {sanitizor} = use('Validator');

/**
 * News Model
 *
 * @class News
 * @extends Model
 */
class News extends Model {

    /**
     * Method to be called only once to boot
     * the model.
     *
     * NOTE: This is called automatically by the IoC
     * container hooks when you make use of `use()`
     * method.
     *
     * @method boot
     *
     * @return {void}
     *
     * @static
     */
    static boot() {
        super.boot();

        /**
         * a hook to create slug before it save to database
         */
        this.addHook('beforeSave', async (instance) => {
            instance.slug = sanitizor.slug(instance.title)
        })
    }

    /**
     * Category relationship
     *
     * @method category
     *
     * @returns {HasOne}
     */
    category() {
        return this.hasOne('App/Models/NewsCategory', 'id', 'id')
    }

}

module.exports = News;
