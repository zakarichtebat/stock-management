<!-- Template -->
<template>
  <div class="pagination" v-if="totalPages > 1">
    <div class="pagination-info">
      Affichage de {{ startItem }}-{{ endItem }} sur {{ totalItems }} éléments
    </div>

    <div class="pagination-controls">
      <!-- Première page -->
      <button 
        class="btn btn-icon btn-sm"
        :disabled="currentPage === 1"
        @click="changePage(1)"
        title="Première page"
      >
        <i class="fas fa-angle-double-left"></i>
      </button>

      <!-- Page précédente -->
      <button 
        class="btn btn-icon btn-sm"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        title="Page précédente"
      >
        <i class="fas fa-angle-left"></i>
      </button>

      <!-- Pages -->
      <div class="pagination-pages">
        <button 
          v-for="page in displayedPages"
          :key="page"
          class="btn btn-sm"
          :class="{ active: page === currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>

      <!-- Page suivante -->
      <button 
        class="btn btn-icon btn-sm"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        title="Page suivante"
      >
        <i class="fas fa-angle-right"></i>
      </button>

      <!-- Dernière page -->
      <button 
        class="btn btn-icon btn-sm"
        :disabled="currentPage === totalPages"
        @click="changePage(totalPages)"
        title="Dernière page"
      >
        <i class="fas fa-angle-double-right"></i>
      </button>
    </div>

    <!-- Sélecteur de taille de page -->
    <div class="pagination-size">
      <select 
        v-model="localPageSize" 
        class="form-select form-select-sm"
        @change="changePageSize"
      >
        <option 
          v-for="size in pageSizes" 
          :key="size" 
          :value="size"
        >
          {{ size }} par page
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'Pagination',

  props: {
    currentPage: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    maxVisiblePages: {
      type: Number,
      default: 5
    },
    pageSizes: {
      type: Array,
      default: () => [10, 25, 50, 100]
    }
  },

  emits: ['update:currentPage', 'update:pageSize'],

  setup(props, { emit }) {
    const localPageSize = ref(props.pageSize)

    const totalPages = computed(() => {
      return Math.ceil(props.totalItems / props.pageSize)
    })

    const startItem = computed(() => {
      return (props.currentPage - 1) * props.pageSize + 1
    })

    const endItem = computed(() => {
      return Math.min(props.currentPage * props.pageSize, props.totalItems)
    })

    const displayedPages = computed(() => {
      const pages = []
      const halfVisible = Math.floor(props.maxVisiblePages / 2)
      let start = Math.max(1, props.currentPage - halfVisible)
      let end = Math.min(totalPages.value, start + props.maxVisiblePages - 1)

      if (end - start + 1 < props.maxVisiblePages) {
        start = Math.max(1, end - props.maxVisiblePages + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    })

    const changePage = (page) => {
      if (page === props.currentPage) return
      emit('update:currentPage', page)
    }

    const changePageSize = () => {
      emit('update:pageSize', localPageSize.value)
      // Recalculer la page courante pour éviter les pages vides
      const newMaxPage = Math.ceil(props.totalItems / localPageSize.value)
      if (props.currentPage > newMaxPage) {
        emit('update:currentPage', newMaxPage)
      }
    }

    watch(() => props.pageSize, (newSize) => {
      localPageSize.value = newSize
    })

    return {
      localPageSize,
      totalPages,
      startItem,
      endItem,
      displayedPages,
      changePage,
      changePageSize
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  color: var(--gray-color);
  font-size: var(--font-size-sm);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-pages .btn {
  min-width: 2rem;
  height: 2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-pages .btn.active {
  background-color: var(--primary-color);
  color: white;
}

.pagination-size {
  min-width: 120px;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .pagination-info {
    text-align: center;
  }
}
</style> 