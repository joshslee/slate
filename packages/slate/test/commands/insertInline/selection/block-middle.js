/** @jsx h */

import { h } from '../../../helpers'

export const run = editor => {
  editor.insertInline(
    <inline void>
      <text />
    </inline>
  )
}

export const input = (
  <value>
    <block>
      wo<cursor />rd
    </block>
  </value>
)

export const output = (
  <value>
    <block>
      wo<inline void>
        <cursor />
      </inline>rd
    </block>
  </value>
)