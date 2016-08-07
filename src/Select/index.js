import classNames from 'classnames'
import Input from 'react-input-autosize'
import ReactDOM from 'react-dom'
import { Component, PropTypes } from 'react'

import CreateOption from './CreateOption'
import Option from './Option'
import Value from './Value'

function stringifyValue(value) {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return value
}

const stringOrNode = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.node,
])

let instanceId = 1

export default class Select extends Component {

  static propTypes = {
    addItemOnKeyCode: PropTypes.number,   // The key code number that should trigger adding
    addLabelText: PropTypes.string.isRequired,       // placeholder displayed when you want to add a
    allowCreate: PropTypes.bool,          // whether to allow creation of new entries
    'aria-label': PropTypes.string,       // Aria label (for assistive tech)
    'aria-labelledby': PropTypes.string,  // HTML ID of an element that should be used as
    autoBlur: PropTypes.bool,             // automatically blur the component when an optio
    autofocus: PropTypes.bool,            // autofocus the component on mount
    autosize: PropTypes.bool,             // whether to enable autosizing or not
    backspaceRemoves: PropTypes.bool,     // whether backspace removes an item if
    backspaceToRemoveMessage: PropTypes.string,  // Message to use for screenreaders to press
    className: PropTypes.string,          // className for the outer element
    clearAllText: stringOrNode,           // title for the "clear" control when multi: true
    clearValueText: stringOrNode,         // title for the "clear" control
    clearable: PropTypes.bool,            // should it be possible to reset value
    delimiter: PropTypes.string,          // delimiter to use to join multiple values for
    disabled: PropTypes.bool,             // whether the Select is disabled or not
    escapeClearsValue: PropTypes.bool,    // whether escape clears the value when the menu is
    filterOption: PropTypes.func,         // method to filter a single option
    filterOptions: PropTypes.any,         // boolean to enable default filtering or function
    ignoreAccents: PropTypes.bool,        // whether to strip diacritics when filtering
    ignoreCase: PropTypes.bool,           // whether to perform case-insensitive filtering
    inputProps: PropTypes.object,         // custom attributes for the Input
    inputRenderer: PropTypes.func,        // returns a custom input component
    isLoading: PropTypes.bool,            // whether the Select is loading externally or
    joinValues: PropTypes.bool,           // joins multiple values into a single form
    labelKey: PropTypes.string,           // path of the label value in option objects
    matchPos: PropTypes.string,           // (any|start) match the start or entire
    matchProp: PropTypes.string,          // (any|label|value) which option property
    menuBuffer: PropTypes.number,         // optional buffer (in px) between the bottom
    menuRenderer: PropTypes.func,         // renders a custom menu with options
    menuStyle: PropTypes.object,          // optional style to apply to the menu
    multi: PropTypes.bool,                // multi-value input
    name: PropTypes.string,               // generates a hidden <input /> tag with this
    newOptionCreator: PropTypes.func,     // factory to create new options when allowCreate
    noResultsText: stringOrNode,          // placeholder displayed when there are no matching
    onBlur: PropTypes.func,               // onBlur handler: function (event) {}
    onBlurResetsInput: PropTypes.bool,    // whether input is cleared on blur
    onChange: PropTypes.func.isRequired,  // onChange handler: function (newValue) {}
    onClose: PropTypes.func,              // fires when the menu is closed
    onFocus: PropTypes.func,              // onFocus handler: function (event) {}
    onInputChange: PropTypes.func,        // onInputChange handler: function (inputValue) {}
    onMenuScrollToBottom: PropTypes.func, // fires when the menu is scrolled to the bottom;
    onOpen: PropTypes.func,               // fires when the menu is opened
    onValueClick: PropTypes.func,         // onClick handler for value labels: function
    openAfterFocus: PropTypes.bool,       // boolean to enable opening dropdown when focused
    openOnFocus: PropTypes.bool,          // always open options menu on focus
    optionClassName: PropTypes.string,    // additional class(es) to apply to the <Option />
    optionComponent: PropTypes.func,      // option component to render in dropdown
    optionRenderer: PropTypes.func,       // optionRenderer: function (option) {}
    options: PropTypes.array,             // array of options
    pageSize: PropTypes.number,           // number of entries to page when using page
    placeholder: stringOrNode,            // field placeholder, displayed when there's no
    required: PropTypes.bool,             // applies HTML5 required attribute when needed
    resetValue: PropTypes.any,            // value to use when you clear the control
    scrollMenuIntoView: PropTypes.bool,   // boolean to enable the viewport to shift so that
    searchable: PropTypes.bool,           // whether to enable searching feature or not
    simpleValue: PropTypes.bool,          // pass the value to onChange as a simple value
    style: PropTypes.object,              // optional style to apply to the control
    tabIndex: PropTypes.string,           // optional tab index of the control
    tabSelectsValue: PropTypes.bool,      // whether to treat tabbing out while focused to
    value: PropTypes.any,                 // initial field value
    valueComponent: PropTypes.func,       // value component to render
    valueKey: PropTypes.string,           // path of the label value in option objects
    valueRenderer: PropTypes.func,        // valueRenderer: function (option) {}
  }

  static defaultProps = {
    addLabelText: 'Create:',
    addItemOnKeyCode: null,
    autosize: true,
    allowCreate: false,
    backspaceRemoves: true,
    backspaceToRemoveMessage: 'Press backspace to remove {label}',
    clearable: true,
    clearAllText: 'Clear all',
    clearValueText: 'Clear value',
    delimiter: ',',
    disabled: false,
    escapeClearsValue: true,
    filterOptions: true,
    ignoreAccents: true,
    ignoreCase: true,
    inputProps: {},
    isLoading: false,
    joinValues: false,
    labelKey: 'label',
    matchPos: 'any',
    matchProp: 'any',
    menuBuffer: 0,
    multi: false,
    noResultsText: 'No results found',
    onBlurResetsInput: false,
    openAfterFocus: false,
    optionComponent: Option,
    pageSize: 5,
    placeholder: 'Select...',
    required: false,
    resetValue: { value: null, label: null },
    scrollMenuIntoView: true,
    searchable: true,
    simpleValue: false,
    tabSelectsValue: true,
    valueComponent: Value,
    valueKey: 'value',
  }

  state = {
    inputValue: '',
    isFocused: false,
    isLoading: false,
    isOpen: false,
    isPseudoFocused: false,
    required: false,
  }

  componentWillMount() {
    this._instancePrefix = 'react-select-' + (++instanceId) + '-'
    const valueArray = this.getValueArray(this.props.value)

    if (this.props.required) {
      this.setState({
        required: this.handleRequired(valueArray[0], this.props.multi),
      })
    }
  }

  componentDidMount() {
    if (this.props.autofocus) {
      this.focus()
    }
  }

  componentWillReceiveProps(nextProps) {
    const valueArray = this.getValueArray(nextProps.value)

    if (nextProps.required) {
      this.setState({
        required: this.handleRequired(valueArray[0], nextProps.multi),
      })
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.isOpen !== this.state.isOpen) {
      const handler = nextState.isOpen ? nextProps.onOpen : nextProps.onClose
      handler && handler()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // focus to the selected option
    if (this.refs.menu && this.refs.focused && this.state.isOpen && !this.hasScrolledToOption) {
      const focusedOptionNode = ReactDOM.findDOMNode(this.refs.focused)
      const menuNode = ReactDOM.findDOMNode(this.refs.menu)
      menuNode.scrollTop = focusedOptionNode.offsetTop
      this.hasScrolledToOption = true
    } else if (!this.state.isOpen) {
      this.hasScrolledToOption = false
    }

    if (this._scrollToFocusedOptionOnUpdate && this.refs.focused && this.refs.menu) {
      this._scrollToFocusedOptionOnUpdate = false
      const focusedDOM = ReactDOM.findDOMNode(this.refs.focused)
      const menuDOM = ReactDOM.findDOMNode(this.refs.menu)
      const focusedRect = focusedDOM.getBoundingClientRect()
      const menuRect = menuDOM.getBoundingClientRect()
      if (focusedRect.bottom > menuRect.bottom || focusedRect.top < menuRect.top) {
        menuDOM.scrollTop = (focusedDOM.offsetTop + focusedDOM.clientHeight - menuDOM.offsetHeight)
      }
    }
    if (this.props.scrollMenuIntoView && this.refs.menuContainer) {
      const menuContainerRect = this.refs.menuContainer.getBoundingClientRect()
      if (window.innerHeight < menuContainerRect.bottom + this.props.menuBuffer) {
        window.scrollBy(0, menuContainerRect.bottom + this.props.menuBuffer - window.innerHeight)
      }
    }
    if (prevProps.disabled !== this.props.disabled) {
      this.setState({ isFocused: false }) // eslint-disable-line react/no-did-update-set-state
      this.closeMenu()
    }
  }

  focus = () => {
    if (!this.refs.input) return
    this.refs.input.focus()

    if (this.props.openAfterFocus) {
      this.setState({
        isOpen: true,
      })
    }
  }

  blurInput = () => {
    if (!this.refs.input) return
    this.refs.input.blur()
  }

  handleTouchMove = (event) => {
    // Set a flag that the view is being dragged
    this.dragging = true
  }

  handleTouchStart = (event) => {
    // Set a flag that the view is not being dragged
    this.dragging = false
  }

  handleTouchEnd = (event) => {
    // Check if the view is being dragged, In this case
    // we don't want to fire the click event (because the user only wants to scroll)
    if (this.dragging) return

    // Fire the mouse events
    this.handleMouseDown(event)
  }

  handleTouchEndClearValue = (event) => {
    // Check if the view is being dragged, In this case
    // we don't want to fire the click event (because the user only wants to scroll)
    if (this.dragging) return

    // Clear the value
    this.clearValue(event)
  }

  handleMouseDown = (event) => {
    // if the event was triggered by a mousedown and not the primary
    // button, or if the component is disabled, ignore it.
    if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
      return
    }

    if (event.target.tagName === 'INPUT') {
      return
    }

    // prevent default event handlers
    event.stopPropagation()
    event.preventDefault()

    // for the non-searchable select, toggle the menu
    if (!this.props.searchable) {
      this.focus()
      return this.setState({
        isOpen: !this.state.isOpen,
      })
    }

    if (this.state.isFocused) {
      // On iOS, we can get into a state where we think the input is focused but it isn't really,
      // since iOS ignores programmatic calls to input.focus() that weren't triggered by a click event.
      // Call focus() again here to be safe.
      this.focus()

      // clears value so that the cursor will be a the end of input then the component re-renders
      this.refs.input.getInput().value = ''

      // if the input is focused, ensure the menu is open
      this.setState({
        isOpen: true,
        isPseudoFocused: false,
      })
    } else {
      // otherwise, focus the input and open the menu
      this._openAfterFocus = true
      this.focus()
    }
  }

  handleMouseDownOnArrow = (event) => {
    // if the event was triggered by a mousedown and not the primary
    // button, or if the component is disabled, ignore it.
    if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
      return
    }
    // If the menu isn't open, let the event bubble to the main handleMouseDown
    if (!this.state.isOpen) {
      return
    }
    // prevent default event handlers
    event.stopPropagation()
    event.preventDefault()
    // close the menu
    this.closeMenu()
  }

  handleMouseDownOnMenu = (event) => {
    // if the event was triggered by a mousedown and not the primary
    // button, or if the component is disabled, ignore it.
    if (this.props.disabled || (event.type === 'mousedown' && event.button !== 0)) {
      return
    }
    event.stopPropagation()
    event.preventDefault()

    this._openAfterFocus = true
    this.focus()
  }

  closeMenu = () => {
    this.setState({
      isOpen: false,
      isPseudoFocused: this.state.isFocused && !this.props.multi,
      inputValue: '',
    })
    this.hasScrolledToOption = false
  }

  handleInputFocus = (event) => {
    const isOpen = this.state.isOpen || this._openAfterFocus || this.props.openOnFocus
    if (this.props.onFocus) {
      this.props.onFocus(event)
    }
    this.setState({
      isFocused: true,
      isOpen,
    })
    this._openAfterFocus = false
  }

  handleInputBlur = (event) => {
    if (this.refs.menu && document.activeElement === this.refs.menu) {
      this.focus()
      return
    }

    if (this.props.onBlur) {
      this.props.onBlur(event)
    }
    const onBlurredState = {
      isFocused: false,
      isOpen: false,
      isPseudoFocused: false,
    }
    if (this.props.onBlurResetsInput) {
      onBlurredState.inputValue = ''
    }
    this.setState(onBlurredState)
  }

  handleInputChange = (event) => {
    let newInputValue = event.target.value
    if (this.state.inputValue !== event.target.value && this.props.onInputChange) {
      const nextState = this.props.onInputChange(newInputValue)
      // Note: != used deliberately here to catch undefined and null
      if (nextState != null && typeof nextState !== 'object') {
        newInputValue = '' + nextState
      }
    }
    this.setState({
      isOpen: true,
      isPseudoFocused: false,
      inputValue: newInputValue,
    })
  }

  handleKeyDown = (event) => {
    if (this.props.disabled) return
    switch (event.keyCode) {
      case 8: // backspace
        if (!this.state.inputValue && this.props.backspaceRemoves) {
          event.preventDefault()
          this.popValue()
        }
        return
      case 9: // tab
        if (event.shiftKey || !this.state.isOpen || !this.props.tabSelectsValue) {
          return
        }
        this.selectFocusedOption()
        return
      case 13: // enter
        if (!this.state.isOpen) return
        event.stopPropagation()
        this.selectFocusedOption()
        break
      case 27: // escape
        if (this.state.isOpen) {
          this.closeMenu()
        } else if (this.props.clearable && this.props.escapeClearsValue) {
          this.clearValue(event)
        }
        break
      case 38: // up
        this.focusPreviousOption()
        break
      case 40: // down
        this.focusNextOption()
        break
      case 33: // page up
        this.focusPageUpOption()
        break
      case 34: // page down
        this.focusPageDownOption()
        break
      case 35: // end key
        this.focusEndOption()
        break
      case 36: // home key
        this.focusStartOption()
      default:
        if (this.props.allowCreate && this.props.multi && event.keyCode === this.props.addItemOnKeyCode) {
          event.preventDefault()
          event.stopPropagation()
          this.selectFocusedOption()
        } else {
          return
        }
        break
    }
    event.preventDefault()
  }

  handleValueClick = (option, event) => {
    if (!this.props.onValueClick) return
    this.props.onValueClick(option, event)
  }

  handleMenuScroll = (event) => {
    if (!this.props.onMenuScrollToBottom) return
    const { target } = event
    if (target.scrollHeight > target.offsetHeight && !(target.scrollHeight - target.offsetHeight - target.scrollTop)) {
      this.props.onMenuScrollToBottom()
    }
  }

  handleRequired = (value, multi) => {
    if (!value) return true
    return (multi ? value.length === 0 : Object.keys(value).length === 0)
  }

  getOptionLabel = (op) => {
    return op[this.props.labelKey]
  }

  getValueArray = (value) => {
    if (this.props.multi) {
      if (typeof value === 'string') value = value.split(this.props.delimiter)
      if (!Array.isArray(value)) {
        if (value === null || value === undefined) return []
        value = [value]
      }
      return value.map(this.expandValue).filter(i => i)
    }
    const expandedValue = this.expandValue(value)
    return expandedValue ? [expandedValue] : []
  }

  expandValue = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') return value
    let { options, valueKey } = this.props
    if (!options) return
    for (let i = 0; i < options.length; i++) {
      if (options[i][valueKey] === value) {
        return options[i]
      }
    }

    if (this.props.allowCreate && value !== '') {
      return this.createNewOption(value)
    }
  }

  setValue = (value) => {
    if (this.props.autoBlur) {
      this.blurInput()
    }
    if (!this.props.onChange) return
    if (this.props.required) {
      const required = this.handleRequired(value, this.props.multi)
      this.setState({ required })
    }
    if (this.props.simpleValue && value) {
      value = this.props.multi ? value.map(i => i[this.props.valueKey]).join(this.props.delimiter) : value[this.props.valueKey]
    }
    this.props.onChange(value)
  }

  selectValue = (value) => {
    this.hasScrolledToOption = false
    if (this.props.multi) {
      this.addValue(value)
      this.setState({
        inputValue: '',
        focusedIndex: null,
      })
    } else {
      this.setState({
        isOpen: false,
        inputValue: '',
        isPseudoFocused: this.state.isFocused,
      })
      this.setValue(value)
    }
  }

  addValue = (value) => {
    const valueArray = this.getValueArray(this.props.value)
    this.setValue(valueArray.concat(value))
  }

  popValue = () => {
    const valueArray = this.getValueArray(this.props.value)
    if (!valueArray.length) return
    if (valueArray[valueArray.length - 1].clearableValue === false) return
    this.setValue(valueArray.slice(0, valueArray.length - 1))
  }

  removeValue = (value) => {
    const valueArray = this.getValueArray(this.props.value)
    this.setValue(valueArray.filter(i => {
      if (i.create) {
        return i[this.props.valueKey] !== value[this.props.valueKey] && i[this.props.labelKey] !== value[this.props.labelKey]
      } else {
        return i !== value
      }
    }))
    this.focus()
  }

  clearValue = (event) => {
    // if the event was triggered by a mousedown and not the primary
    // button, ignore it.
    if (event && event.type === 'mousedown' && event.button !== 0) {
      return
    }
    event.stopPropagation()
    event.preventDefault()
    this.setValue(this.props.resetValue)
    this.setState({
      isOpen: false,
      inputValue: '',
    }, this.focus)
  }

  focusOption = (option) => {
    this.setState({
      focusedOption: option,
    })
  }

  focusNextOption = () => {
    this.focusAdjacentOption('next')
  }

  focusPreviousOption = () => {
    this.focusAdjacentOption('previous')
  }

  focusPageUpOption = () => {
    this.focusAdjacentOption('page_up')
  }

  focusPageDownOption = () => {
    this.focusAdjacentOption('page_down')
  }

  focusStartOption = () => {
    this.focusAdjacentOption('start')
  }

  focusEndOption = () => {
    this.focusAdjacentOption('end')
  }

  focusAdjacentOption = (dir) => {
    const options = this._visibleOptions
      .map((option, index) => ({ option, index }))
      .filter(option => !option.option.disabled)
    this._scrollToFocusedOptionOnUpdate = true
    if (!this.state.isOpen) {
      this.setState({
        isOpen: true,
        inputValue: '',
        focusedOption: this._focusedOption || options[dir === 'next' ? 0 : options.length - 1].option,
      })
      return
    }
    if (!options.length) return
    let focusedIndex = -1
    for (let i = 0; i < options.length; i++) {
      if (this._focusedOption === options[i].option) {
        focusedIndex = i
        break
      }
    }
    if (dir === 'next' && focusedIndex !== -1) {
      focusedIndex = (focusedIndex + 1) % options.length
    } else if (dir === 'previous') {
      if (focusedIndex > 0) {
        focusedIndex = focusedIndex - 1
      } else {
        focusedIndex = options.length - 1
      }
    } else if (dir === 'start') {
      focusedIndex = 0
    } else if (dir === 'end') {
      focusedIndex = options.length - 1
    } else if (dir === 'page_up') {
      var potentialIndex = focusedIndex - this.props.pageSize
      if (potentialIndex < 0) {
        focusedIndex = 0
      } else {
        focusedIndex = potentialIndex
      }
    } else if (dir === 'page_down') {
      var potentialIndex = focusedIndex + this.props.pageSize
      if (potentialIndex > options.length - 1) {
        focusedIndex = options.length - 1
      } else {
        focusedIndex = potentialIndex
      }
    }

    if (focusedIndex === -1) {
      focusedIndex = 0
    }

    this.setState({
      focusedIndex: options[focusedIndex].index,
      focusedOption: options[focusedIndex].option,
    })
  }

  selectFocusedOption = () => {
    // if (this.props.allowCreate && !this.state.focusedOption) {
    //   return this.selectValue(this.state.inputValue);
    // }
    if (this._focusedOption) {
      return this.selectValue(this._focusedOption)
    }
  }

  createNewOption = (value) => {
    let newOption = {}

    if (this.props.newOptionCreator) {
      newOption = this.props.newOptionCreator(value)
    } else {
      newOption[this.props.valueKey] = value
      newOption[this.props.labelKey] = value
    }

    newOption.create = true

    return newOption
  }

  renderLoading() {
    if (!this.props.isLoading) {
      return false
    }
    return (
      <span className="Select-loading-zone" aria-hidden="true">
        <span className="Select-loading" />
      </span>
    )
  }

  renderValue(valueArray, isOpen) {
    const renderLabel = this.props.valueRenderer || this.getOptionLabel
    let ValueComponent = this.props.valueComponent
    if (!valueArray.length) {
      return !this.state.inputValue && (
        <div className="uk-component-select__placeholder">{this.props.placeholder}</div>
      )
    }
    let onClick = this.props.onValueClick ? this.handleValueClick : null
    if (this.props.multi) {
      return valueArray.map((value, i) => {
        return (
          <ValueComponent
            id={this._instancePrefix + '-value-' + i}
            instancePrefix={this._instancePrefix}
            disabled={this.props.disabled || value.clearableValue === false}
            key={`value-${i}-${value[this.props.valueKey]}`}
            onClick={onClick}
            onRemove={this.removeValue}
            value={value}
          >
            {renderLabel(value)}
            <span className="Select-aria-only">&nbsp;</span>
          </ValueComponent>
        )
      })
    } else if (!this.state.inputValue) {
      if (isOpen) onClick = null
      return (
        <ValueComponent
          id={this._instancePrefix + '-value-item'}
          disabled={this.props.disabled}
          instancePrefix={this._instancePrefix}
          onClick={onClick}
          value={valueArray[0]}
        >
          {renderLabel(valueArray[0])}
        </ValueComponent>
      )
    }
  }

  renderInput(valueArray, focusedOptionIndex) {
    if (this.props.inputRenderer) {
      return this.props.inputRenderer()
    } else {
      let className = classNames('uk-component-select__input', this.props.inputProps.className)
      const isOpen = !!this.state.isOpen

      const ariaOwns = classNames({
        [this._instancePrefix + '-list']: isOpen,
        [this._instancePrefix + '-backspace-remove-message']: this.props.multi &&
                                                              !this.props.disabled &&
                                                              this.state.isFocused &&
                                                              !this.state.inputValue,
      })

      // TODO: Check how this project includes Object.assign()
      const inputProps = Object.assign({}, this.props.inputProps, {
        role: 'combobox',
        'aria-expanded': '' + isOpen,
        'aria-owns': ariaOwns,
        'aria-haspopup': '' + isOpen,
        'aria-activedescendant': isOpen ? this._instancePrefix + '-option-' + focusedOptionIndex : this._instancePrefix + '-value',
        'aria-labelledby': this.props['aria-labelledby'],
        'aria-label': this.props['aria-label'],
        className,
        tabIndex: this.props.tabIndex,
        onBlur: this.handleInputBlur,
        onChange: this.handleInputChange,
        onFocus: this.handleInputFocus,
        ref: 'input',
        required: this.state.required,
        value: this.state.inputValue,
      })

      if (this.props.disabled || !this.props.searchable) {
        return (
          <div
            {...this.props.inputProps}
            role="combobox"
            aria-expanded={isOpen}
            aria-owns={isOpen ? this._instancePrefix + '-list' : this._instancePrefix + '-value'}
            aria-activedescendant={isOpen ? this._instancePrefix + '-option-' + focusedOptionIndex : this._instancePrefix + '-value'}
            className={className}
            tabIndex={this.props.tabIndex || 0}
            onBlur={this.handleInputBlur}
            onFocus={this.handleInputFocus}
            ref="input"
            aria-readonly={'' + !!this.props.disabled}
            style={{ border: 0, width: 1, display: 'inline-block' }}
          />
        )
      }

      if (this.props.autosize) {
        return (
          <Input {...inputProps} minWidth="5px" />
        )
      }
      return (
        <div className={className}>
          <input {...inputProps} />
        </div>
      )
    }
  }

  renderClear() {
    if (!this.props.clearable || !this.props.value || (this.props.multi && !this.props.value.length) || this.props.disabled || this.props.isLoading) return
    return (
      <span className="uk-close" title={this.props.multi ? this.props.clearAllText : this.props.clearValueText}
        aria-label={this.props.multi ? this.props.clearAllText : this.props.clearValueText}
        onMouseDown={this.clearValue}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEndClearValue}
      />
    )
  }

  renderArrow() {
    return (
      <span className="Select-arrow-zone" onMouseDown={this.handleMouseDownOnArrow}>
        <span className="Select-arrow" onMouseDown={this.handleMouseDownOnArrow} />
      </span>
    )
  }

  filterOptions = (excludeOptions) => {
    let filterValue = this.state.inputValue
    const originalFilterValue = filterValue
    const options = this.props.options || []
    let filteredOptions = []
    if (typeof this.props.filterOptions === 'function') {
      filteredOptions = this.props.filterOptions.call(this, options, filterValue, excludeOptions)
    } else if (this.props.filterOptions) {
      if (this.props.ignoreCase) {
        filterValue = filterValue.toLowerCase()
      }
      if (excludeOptions) excludeOptions = excludeOptions.map(i => i[this.props.valueKey])
      filteredOptions = options.filter(option => {
        if (excludeOptions && excludeOptions.indexOf(option[this.props.valueKey]) > -1) return false
        if (this.props.filterOption) return this.props.filterOption.call(this, option, filterValue)
        if (!filterValue) return true
        let valueTest = String(option[this.props.valueKey])
        let labelTest = String(option[this.props.labelKey])
        if (this.props.ignoreCase) {
          if (this.props.matchProp !== 'label') valueTest = valueTest.toLowerCase()
          if (this.props.matchProp !== 'value') labelTest = labelTest.toLowerCase()
        }
        return this.props.matchPos === 'start' ? (
          (this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue) ||
          (this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue)
        ) : (
          (this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0) ||
          (this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0)
        )
      })
    } else {
      filteredOptions = options
    }
    if (this.props.allowCreate && filterValue) {
      let addNewOption = true
      // @TODO: only add the "Add" option if none of the options are an exact match
      filteredOptions.map(option => {
        if (String(option.label).toLowerCase() === filterValue || String(option.value).toLowerCase() === filterValue) {
          addNewOption = false
        }
      })
      if (addNewOption) {
        filteredOptions.unshift(this.createNewOption(originalFilterValue))
      }
    }
    return filteredOptions
  }

  renderMenu(options, valueArray, focusedOption) {
    if (options && options.length || this.props.allowCreate) {
      if (this.props.menuRenderer) {
        return this.props.menuRenderer({
          focusedOption,
          focusOption: this.focusOption,
          labelKey: this.props.labelKey,
          options,
          selectValue: this.selectValue,
          valueArray,
        })
      } else {
        let OptionComponent = this.props.optionComponent
        const renderLabel = this.props.optionRenderer || this.getOptionLabel

        return options.map((option, i) => {
          if (option.create) {
            return false
          }
          let isSelected = valueArray && valueArray.indexOf(option) > -1
          let isFocused = option === focusedOption
          let optionRef = isFocused ? 'focused' : null
          let optionClass = classNames(this.props.optionClassName, {
            'Select-option': true,
            'is-selected': isSelected,
            'uk-active': isFocused,
            'is-disabled': option.disabled,
          })

          return (
            <OptionComponent
              instancePrefix={this._instancePrefix}
              optionIndex={i}
              className={optionClass}
              isDisabled={option.disabled}
              isFocused={isFocused}
              key={`option-${i}-${option[this.props.valueKey]}`}
              onSelect={this.selectValue}
              onFocus={this.focusOption}
              option={option}
              addLabelText={this.props.addLabelText}
              isSelected={isSelected}
              ref={optionRef}
            >
              {renderLabel(option)}
            </OptionComponent>
          )
        })
      }
    } else if (this.props.noResultsText && !this.props.allowCreate) {
      return (
        <li className="uk-skip">
          <a>{this.props.noResultsText}</a>
        </li>
      )
    } else {
      return null
    }
  }

  renderHiddenField(valueArray) {
    if (!this.props.name) return
    if (this.props.joinValues) {
      let value = valueArray.map(i => stringifyValue(i[this.props.valueKey])).join(this.props.delimiter)
      return (
        <input
          type="hidden"
          ref="value"
          name={this.props.name}
          value={value}
          disabled={this.props.disabled}
        />
      )
    }
    return valueArray.map((item, index) => (
      <input key={'hidden.' + index}
        type="hidden"
        ref={'value' + index}
        name={this.props.name}
        value={stringifyValue(item[this.props.valueKey])}
        disabled={this.props.disabled}
      />
    ))
  }

  getFocusableOptionIndex = (selectedOption) => {
    const options = this._visibleOptions
    if (!options.length) return null

    const focusedOption = this.state.focusedOption || selectedOption
    if (focusedOption && !focusedOption.disabled) {
      const focusedOptionIndex = options.indexOf(focusedOption)
      if (focusedOptionIndex !== -1) {
        return focusedOptionIndex
      }
    }

    for (let i = 0; i < options.length; i++) {
      if (!options[i].disabled) return i
    }
    return null
  }

  renderOuter(options, valueArray, focusedOption) {
    let menu = this.renderMenu(options, valueArray, focusedOption)
    if (!menu) {
      return null
    }

    const createOption = options && options[0] && options[0].create && options[0]

    const allowCreate = this.props.allowCreate && this.state.inputValue.trim() && createOption

    return (
      <div ref="menuContainer" className="uk-dropdown">
        <ul
          ref="menu"
          role="listbox"
          className="uk-nav uk-nav-autocomplete"
          id={this._instancePrefix + '-list'}
          style={this.props.menuStyle}
          onScroll={this.handleMenuScroll}
          onMouseDown={this.handleMouseDownOnMenu}
        >
          {allowCreate && (
            <CreateOption
              isFocused={focusedOption && focusedOption.create}
              addLabelText={this.props.addLabelText}
            >
              {createOption.label}
            </CreateOption>
          )}
          {allowCreate && options.length > 0 && <li className="uk-nav-divider uk-skip" />}
          {menu}
        </ul>
      </div>
    )
  }

  render() {
    const valueArray = this.getValueArray(this.props.value)
    const options = this._visibleOptions = this.filterOptions(this.props.multi ? valueArray : null)
    let isOpen = this.state.isOpen
    if (this.props.multi && !options.length && valueArray.length && !this.state.inputValue) isOpen = false
    const focusedOptionIndex = this.getFocusableOptionIndex(valueArray[0])

    let focusedOption = null
    if (focusedOptionIndex !== null) {
      focusedOption = this._focusedOption = this._visibleOptions[focusedOptionIndex]
    } else {
      focusedOption = this._focusedOption = null
    }
    let className = classNames('uk-autocomplete uk-component-select', this.props.className, {
      'uk-component-select--multi': this.props.multi,
      'uk-component-select--single': !this.props.multi,
      'uk-component-select--disabled': this.props.disabled,
      'uk-component-select--focus': this.state.isFocused,
      'uk-component-select--loading': this.props.isLoading,
      'uk-open': isOpen,
      'is-pseudo-focused': this.state.isPseudoFocused,
      'is-searchable': this.props.searchable,
      'has-value': valueArray.length,
    })

    let removeMessage = null
    if (this.props.multi &&
      !this.props.disabled &&
      valueArray.length &&
      !this.state.inputValue &&
      this.state.isFocused &&
      this.props.backspaceRemoves) {
      removeMessage = (
        <span
          id={this._instancePrefix + '-backspace-remove-message'}
          className="Select-aria-only"
          aria-live="assertive"
        >
          {this.props.backspaceToRemoveMessage.replace('{label}', valueArray[valueArray.length - 1][this.props.labelKey])}
        </span>
      )
    }

    return (
      <div
        ref="wrapper"
        className={className}
      >
        {this.renderHiddenField(valueArray)}
        <div
          ref="control"
          className="uk-component-select__control"
          style={this.props.style}
          onKeyDown={this.handleKeyDown}
          onMouseDown={this.handleMouseDown}
          onTouchEnd={this.handleTouchEnd}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
        >
          <div className="Select-multi-value-wrapper uk-component-select__values" id={this._instancePrefix + '-value'}>
            {this.renderValue(valueArray, isOpen)}
            {this.renderInput(valueArray, focusedOptionIndex)}
          </div>
          {removeMessage}
          {this.renderLoading()}
          {this.renderClear()}
          {this.renderArrow()}
        </div>
        {isOpen && this.renderOuter(options, !this.props.multi ? valueArray : null, focusedOption)}
      </div>
    )
  }
}
