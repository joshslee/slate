/** @jsx h */

import h from '../../helpers/h'

export const schema = {
  blocks: {
    list: {},
    item: {
      parent: { type: 'list' },
    },
  },
}

export const input = (
  <value>
    <document>
      <block>
        <block>
          <text />
        </block>
      </block>
    </document>
  </value>
)

export const output = (
  <value>
    <document>
      <block>
        <text />
      </block>
    </document>
  </value>
)