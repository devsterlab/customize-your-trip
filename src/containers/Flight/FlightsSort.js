import React, {Component, PropTypes} from 'react';
import Sort from '../../components/Sort';

class FlightsSort extends Component {
    static propTypes = {
        sorting: PropTypes.shape({
            field: PropTypes.string,
            asc: PropTypes.bool
        }),
        onSortChange: PropTypes.func
    };

    shouldComponentUpdate(props) {
        return props.sorting !== this.props.sorting;
    }

    render() {
        return (
            <div>
                <h4 className="inline">Sort by:</h4>

                <Sort selected={this.props.sorting.field == 'price'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('price', asc)}
                >price</Sort>

                <Sort selected={this.props.sorting.field == 'duration'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('duration', asc)}
                >duration</Sort>

                <Sort selected={this.props.sorting.field == 'departTime'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('departTime', asc)}
                >depart time</Sort>
            </div>
        );
    }
}

export default FlightsSort;
