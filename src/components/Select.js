import React, { Component, PropTypes } from 'react';

class Select extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        className: PropTypes.string,
        children: PropTypes.node,
        collection: PropTypes.array,
        itemId: PropTypes.string,
        nameField: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func
    };

    constructor(props) {
        super(props);

        this.handleItemNameChange = this.handleItemNameChange.bind(this);
        let item = props.collection.find(el => el.id == props.itemId);
        this.state = {item: item || {}, itemName: item && item[props.nameField] || ''};
    }

    handleItemNameChange(e) {
        console.log(this.props.collection);
        let item = this.props.collection.find(el => el[this.props.nameField] == e.target.value);
        this.setState({item, itemName: item && item[this.props.nameField] || e.target.value});
        this.props.onChange(item);
    }

    isValid() {
        return !!this.state.item;
    }

    render () {
        return (
            <label className={this.props.className + (this.isValid() ? '': ' is-invalid-label')}>
                {this.props.children}
                <input className={!this.isValid() && 'is-invalid-input'}
                    type="text" placeholder={this.props.placeholder} list={this.props.id}
                    value={this.state.itemName} onChange={this.handleItemNameChange} />
                <datalist id={this.props.id}>
                    {this.props.collection.map(item =>
                        <option key={item.id} value={item[this.props.nameField]} />
                    )}
                </datalist>
            </label>
        );
    }
}

export default Select;
