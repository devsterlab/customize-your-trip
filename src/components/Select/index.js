import React, { Component, PropTypes } from 'react';
import IconButton from '../IconButton';

class Select extends Component {
    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node,
        collection: PropTypes.array,
        itemId: PropTypes.string,
        itemName: PropTypes.string,
        nameField: PropTypes.string,
        placeholder: PropTypes.string,
        error: PropTypes.string,
        onChange: PropTypes.func,
        clearButton: PropTypes.bool
    };

    constructor(props) {
        super(props);

        let item;
        if (props.itemId) item = props.collection.find(el => el.id == props.itemId);
        else if (props.itemName) item = props.collection.find(el => el.name == props.itemName);

        this.state = {
            item: item || {},
            itemName: item && item[props.nameField] || props.itemName || '',
            hideOptions: true,
            searchCollection: [],
            restCollection: props.collection
        };

        this.handleItemNameChange = this._handleItemNameChange.bind(this);
        this.onBlur = this._onBlur.bind(this);
        this.onClear = this._onClear.bind(this);
    }

    componentWillReceiveProps(props) {
        if (!this.props.collection.length && props.collection.length) {
            this.setState({
                searchCollection: [],
                restCollection: props.collection
            });
        }
    }

    _handleItemNameChange(e, hideOptions = false) {
        let item = this.props.collection.find(el => el[this.props.nameField] == e.target.value);
        this.props.onChange(item);
        let [searchCollection, restCollection] = this.searchFilter(
            this.props.collection, item, this.props.nameField, e.target.value);
        this.setState({
            item, itemName: item && item[this.props.nameField] || e.target.value,
            hideOptions,
            searchCollection,
            restCollection
        });
    }

    searchFilter(collection, item, nameField, value) {
        value = value.toLowerCase();
        let search = [], rest = [];
        if (item || !value.trim().length) rest = collection;
        else for (let el of collection) {
            if (el[nameField].toLowerCase().includes(value)) search.push(el);
            else rest.push(el);
        }
        return [search, rest];
    }
    
    isValid() {
        return !!(this.state.item && !this.props.error || !this.state.itemName.length);
    }

    showHideOptions(hideOptions) {
        if (!hideOptions && this.cleared) this.cleared = false;
        else this.setState({hideOptions});
    }

    setItem(item) {
        this.itemSet = true;
        this.props.onChange(item);
        this.setState({
            item, itemName: item && item[this.props.nameField] || this.state.itemName,
            hideOptions: true,
            searchCollection: [],
            restCollection: this.props.collection
        });
    }

    _onBlur() {
        if (!this.itemSet) this.showHideOptions(true);
        else this.itemSet = false;
    }

    _onClear(e) {
        this.cleared = true;
        this.handleItemNameChange({target: {value: ''}}, true);
    }

    render () {
        return (
            <div className={`select ${this.props.className}`}>
                <label className={this.isValid() ? '': 'is-invalid-label'}>
                    {this.props.children}
                    <input className={!this.isValid() && 'is-invalid-input'}
                           onClick={() => this.showHideOptions(false)} onBlur={this.onBlur}
                           type="text" placeholder={this.props.placeholder}
                           value={this.state.itemName} onChange={this.handleItemNameChange} />
                    {this.props.clearButton && this.state.itemName.length &&
                        <IconButton className="mdi-close-circle clear-button" title="Clear" onClick={this.onClear}/>
                    || ''}
                    <span className={'form-error ' + (!this.isValid() ? 'is-visible' : '')}>
                        {this.props.error}
                    </span>
                </label>
                <div className={`options ${this.state.hideOptions && 'hide' || ''}`}>
                    {this.state.searchCollection.map((item, index) =>
                        <div className={`item search `} key={index} onMouseDown={() => this.setItem(item)}>
                            {item[this.props.nameField]}
                        </div>
                    )}
                    {this.state.restCollection.map((item, index) =>
                        <div className={`item rest `} key={index} onMouseDown={() => this.setItem(item)}>
                            {item[this.props.nameField]}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Select;
