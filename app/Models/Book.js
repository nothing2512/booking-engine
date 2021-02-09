'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

/** @type {typeof import('../Helpers/Engine')} */
const Engine = use('App/Helpers/Engine');

/**
 * Book Model
 *
 * @class Book
 * @extends Model
 */
class Book extends Model {

    /**
     * get table name
     *
     * @return {string}
     */
    static get table() {
        return `${Engine.lower("book")}s`
    }

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
         * a hook to set index before it save to database
         */
        this.addHook('beforeSave', async (instance) => {
            if (isNaN(instance.index)) instance.index = await Book.query().getCount() + 1
        })
    }
}

module.exports = Book;
