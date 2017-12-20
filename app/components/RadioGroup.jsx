import React from 'react';
import { render } from 'react-dom';

class RadioGroup extends React.Component {

    constructor(props) {
        super(props);
        this.updateValue = this.updateValue.bind(this);

        this.state = {
            selected: this.props.rgDefault
        };
    }

    updateValue(e) {
        this.setState({selected: e.target.value})
        this.props.rgHandler(e.target.value);
    }

    render() {
        const entries = [];
        for (let i = 0; i < this.props.rgValues.length; i++) {
            const element = this.props.rgValues[i];
            let isChecked = false;
            if (this.state.selected == element[0]) {
                isChecked = true;
            }
            entries.push(
                <label key={i} className={this.props.rlClass}>
                    <input
                        type="radio"
                        className={this.props.rrClass}
                        name={this.props.rrName}
                        value={element[0]}
                        checked={isChecked}
                        onChange={this.updateValue}
                    />
                    <span className={this.props.rsClass}>
                        {element[1]}
                    </span>
                </label>
            );
        }
        return (
            <div className={this.props.rgClass}>
                {entries}
            </div>
        );
    }

}

export default RadioGroup;
