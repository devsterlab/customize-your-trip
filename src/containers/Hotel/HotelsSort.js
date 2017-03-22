import React, {Component, PropTypes} from 'react';
import Sort from '../../components/Sort';

class HotelsSort extends Component {
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
                <h5 className="inline">Sort by:</h5>

                <Sort selected={this.props.sorting.field == 'price'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('price', asc)}
                >price</Sort>

                <Sort selected={this.props.sorting.field == 'stars'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('stars', asc)}
                >stars</Sort>

                <Sort selected={this.props.sorting.field == 'popularity'}
                      asc={this.props.sorting.asc}
                      onClick={asc => this.props.onSortChange('popularity', asc)}
                >popularity</Sort>
            </div>
        );
    }
}

export default HotelsSort;
