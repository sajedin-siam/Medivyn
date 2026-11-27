import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useConfirm } from './useConfirm'

function Harness({ onYes }: { onYes: () => void }) {
  const [dialog, ask] = useConfirm()
  return <>{dialog}<button onClick={() => ask('Delete this entry?', 'Delete entry', onYes)}>Delete</button></>
}

describe('useConfirm', () => {
  it('runs the action only after the user confirms', async () => {
    const onYes = vi.fn()
    const user = userEvent.setup()
    render(<Harness onYes={onYes} />)
    await user.click(screen.getByText('Delete'))
    expect(screen.getByText('Delete this entry?')).toBeInTheDocument()
    await user.click(screen.getByText('Go back'))
    expect(onYes).not.toHaveBeenCalled()
    await user.click(screen.getByText('Delete'))
    await user.click(screen.getByText('Delete entry'))
    expect(onYes).toHaveBeenCalledOnce()
    expect(screen.queryByText('Delete this entry?')).not.toBeInTheDocument()
  })
})
