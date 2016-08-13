import React from 'react'
import { storiesOf } from '@kadira/storybook'
import { Modal } from 'uikit-react'
import { Button } from 'uikit-react'

storiesOf('Modal', module)
  .add('with text', () => (
    <div className="uk-container uk-margin-top">
      <Modal>
        <h1>Headeline</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
          ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
          in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
        deserunt mollit anim id est laborum.</p>
        <Button primary>Close</Button> &nbsp;
        <Button success>Submit</Button> &nbsp;
      </Modal>
    </div>
  ))