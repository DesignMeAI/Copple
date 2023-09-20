const EventModal = ({ isOpen, onClose, onEdit, onDelete }) => {
    if (!isOpen) return null;
    
    return (
      <div className="modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    );
  };

  
  export default EventModal