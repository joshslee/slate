/** @jsx h  */

import { Node } from 'slate'
import h from 'slate-hyperscript'

export const input = (
  <value>
    <element>
      <text key="a" />
      <text key="b" />
    </element>
    <element>
      <text key="c" />
      <text key="d" />
    </element>
  </value>
)

export const test = value => {
  return Array.from(Node.nodes(value, { from: [0, 1] }))
}

export const output = [
  [
    <value>
      <element>
        <text key="a" />
        <text key="b" />
      </element>
      <element>
        <text key="c" />
        <text key="d" />
      </element>
    </value>,
    [],
  ],
  [
    <element>
      <text key="a" />
      <text key="b" />
    </element>,
    [0],
  ],
  [<text key="b" />, [0, 1]],
  [
    <element>
      <text key="c" />
      <text key="d" />
    </element>,
    [1],
  ],
  [<text key="c" />, [1, 0]],
  [<text key="d" />, [1, 1]],
]