import React, {Component, PropTypes} from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

class RemoveItemModal extends Component {
    static propTypes = {
        removeData: PropTypes.shape({
            step: PropTypes.object,
            index: PropTypes.number,
            itemType: PropTypes.string
        }),
        onRemove: PropTypes.func,
        onClose: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.state = {itemName: this.getItemName(props)};
    }

    componentWillReceiveProps(props) {
        this.setState({itemName: this.getItemName(props)});
    }

    shouldComponentUpdate(props) {
        return props.removeData !== this.props.removeData;
    }

    getItemName(props) {
        if (props.removeData) {
            let item = props.removeData.step[props.removeData.itemType];
            switch (props.removeData.itemType) {
                case 'flight':
                    return `${item.fromCity.name} - ${item.toCity.name}`;
                case 'hotel':
                    return item.name;
                case 'car':
                    return `${item.brand} ${item.model}`;
            }
        }
    }

    render() {
        let {removeData, onRemove, ...other} = this.props;
        return (
            <Modal
                closeButton
                className="tiny remove-item-modal"
                show={!!removeData}
                {...other}
            >
                {removeData &&
                <div>
                    <h3>Remove {removeData.itemType}?</h3>
                    <h5>
                        You are about to remove {removeData.itemType} '{this.state.itemName}'.
                        {removeData.itemType != 'car' && <span><br/>All next cities will be removed!</span> || ''}
                    </h5>
                    <div className="float-right remove-actions">
                        <Button className="success" onClick={onRemove}>OK</Button>
                        <Button onClick={this.props.onClose}>Cancel</Button>
                    </div>
                </div>}
            </Modal>
        );
    }
}

export default RemoveItemModal;
