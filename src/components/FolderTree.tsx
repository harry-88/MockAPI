import { ReactNode } from 'react';
import { Folder, ChevronRight, Plus } from 'lucide-react';
import { Endpoint } from '../utils/api';

// A folder node holds endpoints sitting directly in it plus nested child folders.
export interface TreeNode {
  folders: Map<string, TreeNode>;
  endpoints: Endpoint[];
}

// Group endpoints into a nested tree from their URL path: every path segment except
// the last is a folder, e.g. "/finance/salary" → folder "finance" holding endpoint "salary".
export function buildTree(endpoints: Endpoint[]): TreeNode {
  const root: TreeNode = { folders: new Map(), endpoints: [] };
  for (const ep of endpoints) {
    const segments = (ep.path || '').split('/').map((s) => s.trim()).filter(Boolean);
    segments.pop(); // drop the leaf segment — that's the endpoint, not a folder
    let node = root;
    for (const seg of segments) {
      if (!node.folders.has(seg)) node.folders.set(seg, { folders: new Map(), endpoints: [] });
      node = node.folders.get(seg)!;
    }
    node.endpoints.push(ep);
  }
  return root;
}

export function FolderTree({
  node,
  renderEndpoint,
  onAddInFolder,
  parentPath = '',
}: {
  node: TreeNode;
  renderEndpoint: (endpoint: Endpoint) => ReactNode;
  onAddInFolder?: (folderPath: string) => void; // shows a "+" on each folder
  parentPath?: string;
}) {
  return (
    <>
      {node.endpoints.map((ep) => (
        <div key={ep.id}>{renderEndpoint(ep)}</div>
      ))}
      {[...node.folders.entries()].map(([name, child]) => {
        const fullPath = parentPath ? `${parentPath}/${name}` : name;
        return (
          <details key={name} open>
            <summary className="tree-row">
              <ChevronRight className="tree-chevron tree-icon" />
              <Folder className="tree-icon" />
              <span className="tree-label">{name}</span>
              {onAddInFolder && (
                <span className="tree-actions">
                  <span
                    role="button"
                    className="tree-action"
                    title="Add endpoint in this folder"
                    onClick={(e) => { e.preventDefault(); onAddInFolder(fullPath); }}
                  >
                    <Plus style={{ width: 14, height: 14 }} />
                  </span>
                </span>
              )}
            </summary>
            <div className="tree-children">
              <FolderTree
                node={child}
                renderEndpoint={renderEndpoint}
                onAddInFolder={onAddInFolder}
                parentPath={fullPath}
              />
            </div>
          </details>
        );
      })}
    </>
  );
}
