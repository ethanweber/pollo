
def get_chunks(lst, num_chunks=None, size_of_chunk=None):
    """Returns list of n elements, constaining a sublist."""
    if num_chunks:
        assert not size_of_chunk
        size = len(lst) // num_chunks
    if size_of_chunk:
        assert not num_chunks
        size = size_of_chunk
    chunks = []
    for i in range(0, len(lst), size):
        chunks.append(lst[i:i + size])
    return chunks
