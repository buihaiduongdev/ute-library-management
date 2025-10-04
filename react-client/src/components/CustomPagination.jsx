import React from 'react';
import { Group, Button, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

function CustomPagination({ currentPage, totalPages, onPageChange }) {
  // Tính toán các trang để hiển thị
  const getPageNumbers = () => {
    const delta = 2; // Số trang hiển thị mỗi bên
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Group justify="center" gap={0} style={{ marginTop: '1.5rem' }}>
      {/* Previous Button */}
      <Button
        variant="outline"
        color="gray"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          borderRadius: '0.375rem 0 0 0.375rem',
          borderRight: 'none',
        }}
        leftSection={<IconChevronLeft size={16} />}
      >
        Trước
      </Button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <Button
              key={`ellipsis-${index}`}
              variant="outline"
              color="gray"
              size="sm"
              disabled
              style={{
                borderRadius: 0,
                borderRight: 'none',
                cursor: 'default',
                minWidth: '40px',
              }}
            >
              ...
            </Button>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? 'filled' : 'outline'}
            color={currentPage === page ? 'blue' : 'gray'}
            size="sm"
            onClick={() => onPageChange(page)}
            style={{
              borderRadius: 0,
              borderRight: 'none',
              minWidth: '40px',
              fontWeight: currentPage === page ? 600 : 400,
            }}
          >
            {page}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button
        variant="outline"
        color="gray"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          borderRadius: '0 0.375rem 0.375rem 0',
        }}
        rightSection={<IconChevronRight size={16} />}
      >
        Sau
      </Button>
    </Group>
  );
}

export default CustomPagination;
