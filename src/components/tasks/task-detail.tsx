
import type { Task } from 'annotation-api/src/schemas/pipeline';

export type PipelineProps = 
{
  taskId: Task['_id'];
}

/**
 * 
 * @param param0 props
 * @returns pipeline editor
 */
export default function Pipeline(
  { taskId } : PipelineProps
)
{
  
}
