document.addEventListener('DOMContentLoaded', function() {

    // --- LOGIC FOR MULTIPLE CHOICE QUESTIONS ---
    const mcqOptions = document.querySelectorAll('.mcq-option');
    mcqOptions.forEach(option => {
      option.addEventListener('click', function() {
        const group = this.dataset.group;
        document.querySelectorAll(`.mcq-option[data-group="${group}"]`).forEach(opt => {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');
      });
    });

    // --- LOGIC FOR DRAG AND DROP ORDERING ---
    const draggables = document.querySelectorAll('.drag-option');
    const dragContainers = document.querySelectorAll('.drag-container');
    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', () => draggable.classList.add('dragging'));
      draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));
    });
    dragContainers.forEach(container => {
      container.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) container.appendChild(draggable);
        else container.insertBefore(draggable, afterElement);
      });
    });
    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.drag-option:not(.dragging)')];
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        else return closest;
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // --- LOGIC FOR THE FINISH QUIZ BUTTON ---
    const finishButton = document.getElementById('finish-quiz-btn');
    if (finishButton) {
      finishButton.addEventListener('click', () => alert('Great Job! You have a keen eye for detail.'));
    }
    
    // --- LOGIC FOR THE MATCHING GAME WITH LINE DRAWING ---
    const matchingContainers = document.querySelectorAll('.matching-container');
    matchingContainers.forEach(container => {
        const canvas = container.nextElementSibling;
        const ctx = canvas.getContext('2d');
        const options = container.querySelectorAll('.match-option');
        let firstSelection = null;
        let matchedPairs = [];

        function resizeCanvas() {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            redrawLines();
        }

        function getAnchorPoint(element) {
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const x = element.parentElement.classList.contains('matching-column') && element.parentElement.nextElementSibling ? rect.width - 2 : 2;
            const y = rect.top - containerRect.top + rect.height / 2;
            return { x, y };
        }

        function redrawLines() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#2e7d32';
            ctx.lineWidth = 2;
            matchedPairs.forEach(pair => {
                const startPoint = getAnchorPoint(pair.start);
                const endPoint = getAnchorPoint(pair.end);
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(endPoint.x, endPoint.y);
                ctx.stroke();
            });
        }

        options.forEach(option => {
            option.addEventListener('click', function() {
                if (this.classList.contains('matched')) return;
                
                if (!firstSelection) {
                    // First selection
                    options.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    firstSelection = this;
                } else {
                    // Second selection
                    if (firstSelection.dataset.match === this.dataset.match && firstSelection !== this) {
                        // It's a match!
                        this.classList.add('matched');
                        firstSelection.classList.add('matched');
                        matchedPairs.push({ start: firstSelection, end: this });
                        redrawLines();
                        firstSelection = null;
                    } else {
                        // Not a match or same item clicked
                        this.classList.remove('selected');
                        firstSelection.classList.remove('selected');
                        firstSelection = null;
                    }
                }
            });
        });
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    });
});