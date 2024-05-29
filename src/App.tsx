import React, { useState } from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import './App.css';

const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`
  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "lightgreen" : "grey",
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 250
});

function App() {
  const [state, setState] = useState([getItems(10), getItems(5, 10)]);
  const [editingItem, setEditingItem] = useState({ groupIndex: null, itemIndex: null, content: "" });
  const [newItemContent, setNewItemContent] = useState("");

  function onDragEnd(result) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setState(newState.filter(group => group.length));
    }
  }

  const handleEditChange = (e) => {
    setEditingItem({ ...editingItem, content: e.target.value });
  };

  const handleEditSave = (groupIndex, itemIndex) => {
    const newState = [...state];
    newState[groupIndex][itemIndex].content = editingItem.content;
    setState(newState);
    setEditingItem({ groupIndex: null, itemIndex: null, content: "" });
  };

  const handleNewItemChange = (e) => {
    setNewItemContent(e.target.value);
  };

  const handleAddNewItem = () => {
    const newItem = {
      id: `item-${state[0].length}-${new Date().getTime()}`,
      content: newItemContent
    };
    const newState = [...state];
    newState[0] = [...newState[0], newItem];
    setState(newState);
    setNewItemContent("");
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setState([...state, []]);
        }}
      >
        Add new group
      </button>
      <button
        type="button"
        onClick={() => {
          setState([...state, getItems(1)]);
        }}
      >
        Add new item
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={newItemContent}
            onChange={handleNewItemChange}
            placeholder="Add new item"
          />
          <button onClick={handleAddNewItem}>Add</button>
        </div>
        <div style={{ display: "flex" }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {state.map((el, ind) => (
              <Droppable key={ind} droppableId={`${ind}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                    {el.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            <div style={{ display: "flex", flexDirection:"column", gap:"10px" }}>
                              {editingItem.groupIndex === ind && editingItem.itemIndex === index ? (
                                <>
                                  <input
                                    type="text"
                                    value={editingItem.content}
                                    onChange={handleEditChange}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleEditSave(ind, index)}
                                  >
                                    Save
                                  </button>
                                </>
                              ) : (
                                <>
                                  {item.content}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingItem({ groupIndex: ind, itemIndex: index, content: item.content });
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newState = [...state];
                                      newState[ind].splice(index, 1);
                                      setState(newState.filter(group => group.length));
                                    }}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}

export default App;
